import express, {Request, Response } from 'express';
import CategoryDB from '../../models/ICategory'; 
import { deletePost, getAllPosts, getLastFivePosts, getPublicPostById, updatePost } from '../../services/webService/postWebService';
import { getAllUsers } from '../../services/webService/authWebService';
import { deleteComment, getAllComments, toggleCommentStatus } from '../../services/webService/commentWebService';

export const adminController = express.Router();

// Admin Paneli Ana Rotası (URL: /admin) 
adminController.get("/", async (req: Request, res: Response) => {
    const categories = await CategoryDB.find().sort({ name: 1 });
    const lastPosts = await getLastFivePosts(); // <<< Son 5 postu çek
    const user = res.locals.user; 
    res.render("admin", { 
        pageTitle: 'Yönetim Paneli Dashboard',
        user: user,
        categories: categories,
        lastPosts: lastPosts 
    });
});

//Post Detayını Görüntüleme (URL: /admin/posts/view/:id)
adminController.get("/posts/view/:id", async (req: Request, res: Response) => {
    const postID = req.params.id;
    const user = res.locals.user; 
    const post = await getPublicPostById(postID); 
    if (!post) {
        return res.redirect("/admin"); // Post bulunamazsa admin paneline geri dön
    }else{
     res.render("admin/post-detail", {  
        pageTitle: `Haber Detayı: ${post.title}`,
        post: post,
        user: user
    });}
});

// Post Düzenleme Sayfasını Açma (URL: /admin/posts/update/:id)
adminController.get("/posts/update/:id", async (req: Request, res: Response) => {
    const postID = req.params.id;
    const user = res.locals.user;
    
    try {
        const post = await getPublicPostById(postID); 
        const categories = await CategoryDB.find().sort({ name: 1 }); 
        
        if (!post) {
            return res.redirect("/admin"); 
        }

        res.render("posts/posts-update", { 
            pageTitle: `Haber Düzenle: ${post.title}`,
            post: post,
            user: user,
            categories: categories 
        });

    } catch (error) {
        console.error("Haber güncelleme sayfası yüklenirken hata:", error);
        return res.redirect("/admin"); 
    }
});

//Post Güncelleme Formunu İşleme (POST: /admin/posts/update/:id)
adminController.post("/posts/update/:id", async (req: Request, res: Response) => {
  const postID = req.params.id;
  const user = res.locals.user;

  if (!user || !user._id || !user.role) {
      return res.redirect("/auth"); 
  }

  try {
    const updateStatus = await updatePost(postID, req.body, { id: user._id, role: user.role });

    if (updateStatus === true) {
      return res.redirect(`/admin/posts/view/${postID}`);
    } else {
      return res.render("posts/posts-update", {
        pageTitle: `Haber Düzenle: ${req.body.title}`,
        post: { ...req.body, _id: postID }, 
        user: user,
        error: updateStatus // Servisten dönen hata mesajı
      });
    }
  } catch (error) {
    console.error("Haber güncellenirken hata:", error);
    return res.render("posts/posts-update", {
      pageTitle: `Haber Düzenle: ${req.body.title}`,
      post: { ...req.body, _id: postID },
      user: user,
      error: "Haber güncellenirken bir hata oluştu."
    });
  }
});

// Admin post silme
adminController.get("/posts/delete/:id", async (req: Request, res: Response) => {
    const postID = req.params.id;
    const adminUser = req.session.user!;
    const deleteStatus = await deletePost(postID, adminUser.id, adminUser.role); 

    if (deleteStatus) {
        return res.redirect("/admin/posts");
    } else {
        return res.redirect("/admin/posts");
    }
});

// Tüm Haberleri Listeleme (URL: /admin/posts)
adminController.get("/posts", async (req: Request, res: Response) => {
    try {
        const allPosts = await getAllPosts(); 
        const user = res.locals.user; 
        res.render("posts/admin-post-list", { user: user,allPosts: allPosts});
    } catch (error) {
        console.error("Tüm haberler yüklenirken hata:", error);
        res.redirect("/admin");
    }
});

// Tüm Kullanıcıları Listeleme (URL: /admin/users)
adminController.get("/users",async(req:Request,res:Response)=>{
    try {
        const users= await getAllUsers();
        const user= res.locals.user;
        res.render("user",{
            pageTitle:'Tüm Kullanıcılar',
            user:user,
            users:users
        });                                 
        
    } catch (error) {
        console.error("Tüm kullanıcılar yüklenirken hata:", error);
    }
});

//Tüm yorumları listeleme (URL: /admin/comments)
adminController.get("/comments", async (req: Request, res: Response) => {
    try {
       const user = res.locals.user;
        const comments = await getAllComments(); 
        res.render('comments', { 
            pageTitle: 'Yorum Yönetimi',
            comments: comments,
            user
        });

    } catch (error) {
        console.error("Admin Yorumları Yüklenirken Hata:", error);
        
    }
});

// Yorum Silme- Admin Yetkisi ile (URL: /admin/comments/delete/:commentId)
adminController.post("/comments/delete/:commentId", async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const adminUser = req.session.user!; 
        await deleteComment(commentId, adminUser.id, adminUser.role);
        return res.redirect('/admin/comments');

    } catch (error) {
        console.error("Yorum silme hatası:", error);
        return res.redirect('/admin/comments');
    }
});

// Yorum Durumunu Değiştirme Rotası - Onayla/Kaldır (URL: /admin/comments/toggle/:commentId)
adminController.post("/comments/toggle/:commentId" ,async (req: Request, res: Response) => {
    
    const { commentId } = req.params;
    const { targetStatus } = req.body; 
    const adminId = req.session.user!.id; 
    
    try {
        await toggleCommentStatus(commentId, targetStatus, adminId); 
        return res.redirect('/admin/comments'); 

    } catch (error) {
        console.error("toggleCommentStatus Controller hatası:", error);
        return res.redirect('/admin/comments');
    }
});