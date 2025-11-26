import { Request } from "express";
import PostDB,{ IPost } from "../../models/IPost";
import mongoose from "mongoose";
import { eRoles } from "../../utils/eRoles";
import CommentDB from "../../models/IComment";


export const addPost = async ( post: IPost, authorId: string,file?: Express.Multer.File) => {
  try {
    post.author = new mongoose.Types.ObjectId(authorId);

    // Eğer resim yüklendiyse DB’ye kaydet
    if (file) {
      post.image = "/uploads/posts/" + file.filename;
    }

    await PostDB.create(post);
    return true;
  } catch (error) {
    console.error("addPost error:", error);
    return "Post eklenirken hata oluştu";
  }
};

// Kullanıcının kendi postlarını getirme
export const getMyPosts = async (authorId: string) => {
    try {
        const objectIdAuthor = new mongoose.Types.ObjectId(authorId);
        const posts = await PostDB.find({ author: objectIdAuthor }).sort({ createdAt: -1 });
        return posts;
    } catch (error) {
        console.error("getMyPosts error:", error);
        return null;
    }
};

// Post silme
export const deletePost = async (postID: string, currentUserId: string, currentUserRole?: string) => {
    try {
        const objectIdPost = new mongoose.Types.ObjectId(postID);

        const query: any = { _id: objectIdPost };

        // Admin değilse → sadece kendi postunu silebilir
        if (currentUserRole !== eRoles.Admin) {
            const objectIdAuthor = new mongoose.Types.ObjectId(currentUserId);
            query.author = objectIdAuthor;
        }

        //Silinecek post var mı?
        const post = await PostDB.findOne(query);
        if (!post) return false;

        //Post’a bağlı yorumları sil
        await CommentDB.deleteMany({ postId: objectIdPost });

        //Son olarak post’u sil
        const deleteStatus = await PostDB.deleteOne({ _id: objectIdPost });

        return deleteStatus.deletedCount === 1;

    } catch (error) {
        console.error("deletePost error:", error);
        return false;
    }
};

// Tek bir postu getirme
export const getOnePost = async (postID: string, authorId: string) => {
    try {
        const objectIdAuthor = new mongoose.Types.ObjectId(authorId);
        const objectIdPost = new mongoose.Types.ObjectId(postID);

        const onePost = await PostDB.findOne({ 
            _id: objectIdPost, 
            author: objectIdAuthor 
        });
        
        return onePost;
    } catch (error) {
        console.error("getOnePost error:", error);
        return null;
    }
};

// Post güncelleme
export async function updatePost(postId: string,data: any,user: { id: string; role: eRoles }
) {
    try {
        const post = await PostDB.findById(postId);

        if (!post) {
            return "Post bulunamadı.";
        }

        // Customer → hiçbir şekilde güncelleme yapamaz
        if (user.role === eRoles.Customer) {
            return "Bu rol haber güncelleme yetkisine sahip değil.";
        }

        // User → sadece kendi yazdığı postu güncelleyebilir
        if (user.role === eRoles.User && post.author.toString() !== user.id.toString()) {
            return "Bu haberi güncelleme yetkiniz yok.";
        }

        //  Admin → tüm postları güncelleyebilir (sınırsız)

        // ---- Güncellenebilir alanların uygulanması ----
        if (typeof data.title === "string") post.title = data.title;
        if (typeof data.content === "string") post.content = data.content;
        if (data.category) post.category = data.category;

        await post.save(); 

        return true;

    } catch (err) {
        console.error("updatePost Error:", err);
        return "Güncelleme sırasında bir hata oluştu.";
    }
}

// Belirli bir kategorideki postları getirme
export const getPostsByCategory = async (categoryId: string): Promise<IPost[]> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) return [];
    const posts = await PostDB.find({ category: categoryId })
        .populate('author', 'name') // Yazar bilgilerini yükle
        .populate('category', 'name')   // Kategori bilgilerini yükle
        .sort({ createdAt: -1 });
    return posts;
  } catch (error) {
    console.error("getPostsByCategory error:", error);
    return [];
  }
};

//Tüm postları getirme
export const getAllPosts = async (): Promise<IPost[]> => {
  try {
    const posts = await PostDB.find()
        .populate('author', 'name') // Yazar bilgilerini yükle
        .populate('category', 'name')   // Kategori bilgilerini yükle
        .sort({ createdAt: -1 });
    return posts;
  } catch (error) {
    console.error("getAllPosts error:", error);
    return [];
  }
}; 


// Post ID'sine göre tek bir postu getirir (Home için)
export const getPublicPostById = async (postId: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(postId)) return null;

        const post = await PostDB.findById(postId)
            // Yazar (author) bilgisini yükle
            .populate('author', 'name') 
            // Kategori (category) bilgisini yükle
            .populate('category', 'name');   

        return post;
    } catch (error) {
        console.error("getPublicPostById error:", error);
        return null;
    }
};
// Son 5 postu getirir (Admin Dashboard için)
export const getLastFivePosts = async (): Promise<IPost[]> => {
    try {
        const posts = await PostDB.find()
            .populate('author', 'name')     // Yazar adını getirmek için populate
            .populate('category', 'name')   // Kategori adını getirmek için populate
            .sort({ createdAt: -1 })        // En yeni post üste gelecek şekilde sırala
            .limit(5);                      // Sadece 5 kayıt getir
        return posts;
    } catch (error) {
        console.error("getLastFivePosts error:", error);
        return [];
    }
};

// Post arama fonksiyonu (Başlık ve içerikte arama yapar)
export const searchPosts = async (query: string) => {
    if (!query || query.length < 2) {
        return []; // Çok kısa sorguları reddet veya tüm postları döndür
    }
    const searchRegex = new RegExp(query, 'i'); 

    // $or ile birden fazla alanda arama yapıyoruz
    const posts = await PostDB.find({
        $or: [
            { title: { $regex: searchRegex } }, // Başlıkta ara
            { content: { $regex: searchRegex } } // İçerikte ara
        ],
      
    })
    .populate('author', 'name') // Yazar adını çek
    .populate('category', 'name') // Kategori adını çek
    .sort({ createdAt: -1 }); // En yeniye göre sırala

    return posts;
};