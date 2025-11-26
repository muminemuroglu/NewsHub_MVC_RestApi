import { Request } from "express";
import { emailValid } from "./authWebService";
import UserDB from "../../models/IUser";
import * as bcrypt from "bcrypt";

export const profileUpdate = async (req: Request, data: any): Promise<boolean> => {
  const name = data.name;
  const email = data.email;
  const password = data.password;

  if (!emailValid(email)) return false;
  const user: any = req.session.user;
  if (!user || !user.id) return false; 

  // DB için güncelleme objesi oluştur
  const updateData: any = { name,email};

  if (typeof password === "string" && password.trim() !== "") 
    {
        updateData.password = await bcrypt.hash(password, 10);
    }

  try {
    //DB güncellemesi
    const updatedUser = await UserDB.findByIdAndUpdate(user.id, updateData, { new: true });
    if (!updatedUser) return false;

    //Session güncelle
    req.session.user = {
      ...user,
      name: updatedUser.name,
      email: updatedUser.email
    };

    return true;
  } catch (error: any) {
    console.error("Profil güncellenirken hata:", error.message || error);
    return false;
  }
};

//Kullanıcının ID'sine göre tüm profil verilerini veritabanından çeker.
 
export const getUserProfile = async (userId: string) => {
    // Parola (password) ve JWT token'ı hariç tüm alanları çekiyoruz.
    return await UserDB.findById(userId).select('-password -jwt');
};
