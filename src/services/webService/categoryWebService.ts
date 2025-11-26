import mongoose from "mongoose";
import CategoryDB,{ ICategory } from "../../models/ICategory";
import { Request } from "express";
import CommentDB from "../../models/IComment";
import PostDB from "../../models/IPost";


//  Tüm kategorileri getir
export const getAllCategories =async() : Promise<ICategory[]> =>{
    try {
    const categories = await CategoryDB.find().sort({ createdAt: -1 });//Tüm kategorileri çekiyoruz,son eklenenler en üüstte olacak şekilde
    return categories;
  } catch (error) {
    console.error("getAllCategories error:", error);//Hata durumunda boş dizi dönecek
    return [];
  }
}

//  Yeni kategori oluştur
export const addCategory = async (data: Partial<ICategory>): Promise< boolean| string> => {
  try {
    const existing = await CategoryDB.findOne({ name: { $regex: new RegExp(data.name!, "i") } });
    if (existing) return "Category name already exists.";

     const rawIsActive = data.isactive as unknown;
     const isActiveValue = (rawIsActive === 'on') || (rawIsActive === true);

    const category = new CategoryDB({
      name: data.name,
      description: data.description || "",
      isactive: isActiveValue, 
    });

    await category.save();
    return true;
  } catch (error) {
    console.error("addCategory error:", error);
    return "Category creation failed.";
  }
};

// Tek kategori getir
export const getCategoryById=async(id:string) :Promise<ICategory | null> =>{
  try {
     if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await CategoryDB.findById(id);
  } catch (error) {
    return null;
  }
 
}

// Kategori güncelle
export const updateCategory = async (id: string, data: Partial<ICategory>) => {
  try {
    const rawIsActive = data.isactive as unknown;
    const isActiveValue = (rawIsActive === 'on') || (rawIsActive === true);
    const updateStatus = await CategoryDB.updateOne(
      { _id: id },
      {
        $set: {
          name: data.name,
          description: data.description,
           isactive: isActiveValue,
          updatedAt: new Date()
        }
      }
    );
    return true;
  } catch (error) {
    console.error("updateCategory error:", error);
    return "Category Update Fail";
  }
};

// Kategori sil
export const deleteCategory = async (req: Request, id: string): Promise<string | true> => { 
  try {
    // 1. Silinecek kategoriyi kontrol etme
    const category = await CategoryDB.findById(id);
    if (!category) return "Category not found.";

    // Bu ID'ler hem postları silmek hem de yorumları bulmak için kullanılacak.
    const postsToDelete = await PostDB.find({ category: id }).select('_id');
    const postIds = postsToDelete.map(post => post._id);

  
    // Bulunan tüm post ID'lerine bağlı yorumları siliyoruz.
    if (postIds.length > 0) {
        await CommentDB.deleteMany({ post: { $in: postIds } });
    }

    // İlgili kategorideki tüm postları sil
    await PostDB.deleteMany({ category: id });

    // Son olarak kategoriyi sil
    await CategoryDB.findByIdAndDelete(id);

    return true;
  } catch (error) {
    console.error("deleteCategory error:", error);
    return "Category deletion failed.";
  }
};