import express, { Request, Response } from "express";
import CategoryDB from "../../models/ICategory"; // Kategori modelinizi ekledik
import {deletePost,getMyPosts, getOnePost,addPost, updatePost,} from "../../services/webService/postWebService";
import { upload } from "../../middlewares/uploadMiddleware";

export const dashboardController = express.Router();

// Dashboard Ana Sayfa (Kullanıcının postlarını listeler)
dashboardController.get("/", async (req: Request, res: Response) => {
  // globalFilter tarafından ayarlandı
  const user = res.locals.user; 

  // Kullanıcı oturum açmamışsa (globalFilter veya sessionCheckAuth'tan kaçmışsa)
  if (!user || !user.id) {
    return res.redirect("/auth"); 
  }
  // Postları getirirken kullanıcının ID'sini gönder
  const posts = await getMyPosts(user.id); //Kullanıcının postlarını al
  const categories = await CategoryDB.find().sort({ name: 1 });
  
  const arr = posts != null ? posts : []; 
  
  res.render("dashboard", { user, posts: arr, categories }); 
});

// Post Ekleme
dashboardController.post("/postAdd",upload.single("image"), async (req: Request, res: Response) => {
  const user = res.locals.user;
  const post = req.body;

  if (!user || !user.id) {
    return res.redirect("/auth"); 
  }
  const file = req.file;
  // Service'e post verisini ve yazar ID'sini gönder
  const status = await addPost(post, user.id, file);

  if (status === true) {
    return res.redirect("/dashboard");
  } else {
    // Hata durumunda tekrar sayfayı render et
    const posts = await getMyPosts(user.id);
    const categories = await CategoryDB.find().sort({ name: 1 });
    return res.render("dashboard", { user, posts, categories, status });
  }
});


// Kullanıcı kendi postunu siler
dashboardController.post("/postDelete/:id", async (req: Request, res: Response) => {
  const postID = req.params.id;
  const user = req.session.user; 

  await deletePost(postID, user.id); 
  
  res.redirect("/dashboard"); 
});

//  Post Düzenleme Sayfasını Getirme 
dashboardController.get("/postEdit/:id", async (req: Request, res: Response) => {
  const postID = req.params.id;
  const user = res.locals.user;

  if (!user || !user.id) {
    return res.redirect("/auth"); 
  }
  
  // Postu getir (Sadece kendi postunu düzenleyebilir)
  const post = await getOnePost(postID, user.id); 
  
  //Kategori listesini çek(Postu güncellerken seçilebilmesi için)
  const categories = await CategoryDB.find({ isactive: true }).sort({ name: 1 });
  
  if (post == null) {
    // Post bulunamazsa veya kullanıcı postun yazarı değilse
    res.redirect("/dashboard");
    return;
  } else {
    // EJS'ye hem postu hem de kategorileri gönder
    res.render("posts/posts-update", { 
        post: post, 
        user: res.locals.user,
        categories: categories 
    });
  }
});

// Post Güncelleme
dashboardController.post("/postUpdate/:id", async (req: Request, res: Response) => {
  const postId = req.params.id;
    const data = req.body;
    const user = res.locals.user;

    const result = await updatePost(postId, data, user);

    if (result !== true) {
        return res.render("dashboard/update", {
            error: result,
            postId,
            form: data
        });
    }

    return res.redirect("/");
});