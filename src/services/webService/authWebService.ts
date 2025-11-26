import UserDB, { IUser } from "../../models/IUser";
import * as bcrypt from 'bcrypt'; 

const SALT_ROUNDS = 10; // Bcrypt güvenlik seviyesi



//UserLogin Fonk.
export const userLogin=(user:IUser):string |boolean=>{
    if(!emailValid(user.email)){
        return "Invalild email format";
    }
    if(!passwordValid(user.password)){
        return "Password must be 6-10 characters long, include at least one uppercase letter, one number, and one special character."
    }
    return true
}

//UserLoginDb Fonk. (Bcrypt ile şifre kontrolü yapılıyor)

export const userLoginDb = async (user: IUser, req) => {
  try {
    const dbUser = await UserDB.findOne({ email: user.email });

    if (!dbUser) return "Email or Password Fail";
    const isMatch = await bcrypt.compare(user.password, dbUser.password); 

    if (!isMatch) return "Email or Password Fail";

    // Session oluşturma
    req.session.user = {
      id: dbUser._id.toString(),
      name: dbUser.name,
      role: Array.isArray(dbUser.roles) ? dbUser.roles[0] : dbUser.roles 
    };

    return true;
  } catch (error) {
    console.error("userLoginDb error", error);
    return "An unknown error occured";
  }
};



//UserRegister Fonk.
export const userRegister =(user:IUser):string | boolean =>{
  if(user.name!=''&& user.name.length<3){
    return "Full name must be at least 3 characters.";
  }else if(!emailValid(user.email)){
    return "Invalid email format.";
  }else if(!passwordValid(user.password)){
     return "Password must be 3-15 characters long, include at least one uppercase letter, one number, and one special character.";
  }
   return true
}

//UserRegisterDB Fonk. (Bcrypt ile şifre hashleniyor)
export const userRegisterDb =async (user :IUser)=>{
  try {
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    const newUser= new UserDB({...user, password: hashedPassword});
    await newUser.save();
     return true;
  } catch (error) {
    if(error instanceof Error){
      if(error.message.includes("duplicate key error")){
         return "Email already exists."
      }
      return error.message;
    }
    return "An unknown error occured"
  }
}

//Tüm Kullanıcıları Getiren Fonk.
export const getAllUsers= async()=>{
  try {
    const users= await UserDB.find().sort({name:1});
    return users;
  } catch (error) {
    console.error("getAllUsers error",error);
    return [];
  }
};



export const emailValid = (email: string) => {
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
};

// min 6 karakter max 10
// 1 özel karakter
// 1 sayısal karakter
// 1 büyük karakter
/*
Abc1!d
Xyz9#Q
Qwert7*
Java8@A
Code1$X
Train9%T
 */
export const passwordValid = (password: string) => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{6,10}$/;
  return regex.test(password);
};