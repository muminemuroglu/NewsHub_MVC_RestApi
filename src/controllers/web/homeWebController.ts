import express from 'express'
import CategoryDB from '../../models/ICategory';
import {getAllPosts,getPostsByCategory,getPublicPostById,searchPosts} from '../../services/webService/postWebService';
import { getUserProfile, profileUpdate } from '../../services/webService/profileWebService';
import { getCommentsForPostDetail } from '../../services/webService/commentWebService';
import { sessionCheckAuth } from '../../middlewares/authMiddleware';

export const homeController = express.Router();
 
// Anasayfa-Tüm Postları Listeler
homeController.get("/", async (req, res) => {
    try {
        // Navbar için tüm aktif kategorileri getir
        const categories = await CategoryDB.find({ isactive: true }).sort({ name: 1 });
        const categoryArr = categories || [];
        
        // Tüm postları getir
        const posts = await getAllPosts(); 

        res.render("home", {
            categories: categoryArr, 
            posts: posts,           
            pageTitle: "Son Haberler",
            activeCategoryId: null 
        });
    } catch (error) {
        console.error("Anasayfa Yüklenirken Hata:", error);
    }
});

// Belirli Kategoriye Ait Postları Listeler
homeController.get("/category/:categoryId", async (req, res) => {
    const categoryId = req.params.categoryId;

    try {
        // Navbar için tüm aktif kategorileri getir
        const categories = await CategoryDB.find({ isactive: true }).sort({ name: 1 });
        const categoryArr = categories || [];
        const posts = await getPostsByCategory(categoryId); 
        
        // Aktif kategoriyi bul ve sayfa başlığını ayarla
        const activeCategory = categoryArr.find(c => c._id.toString() === categoryId);
        
        const pageTitle = activeCategory 
            ? `${activeCategory.name} Kategorisindeki Haberler` 
            : "Kategori Bulunamadı";

        res.render("home", { 
            categories: categoryArr, 
            posts: posts,           
            pageTitle: pageTitle,
            activeCategoryId: categoryId 
        });
    } catch (error) {
        console.error("Kategori Sayfası Yüklenirken Hata:", error);
    }
});

// Post Detay Sayfası
homeController.get("/posts/:id", async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await getPublicPostById(postId);
        if (!post) {
            return res.status(404).render('404', { pageTitle: 'Post Bulunamadı' });
        }

        const categories = await CategoryDB.find({});
        const user = req.session.user;

        // Kullanıcının id'sini ve rolünü çekiyoruz
        const currentUserId = user ? user.id : null; 
        const currentUserRole = user ? user.role : null; 

        // Servise hem 'id'yi hem de rolü gönderiyoruz.
        const comments = await getCommentsForPostDetail(postId, currentUserId, currentUserRole);


        res.render('posts/post-detail', { 
            post,
            pageTitle: post.title,
            categories,
            comments,
            user 
        });

    } catch (error) {
        console.error("Post Detay Yüklenirken Hata:", error);
    }
});

// Profil Sayfası
homeController.get("/profile", sessionCheckAuth, async (req, res) => {
  const userId = req.session.user!.id; 

  try {
    
    const fullUser = await getUserProfile(userId); // Veritabanından eksiksiz kullanıcı verisini çekiyoruz.
    if (!fullUser) {
       return res.redirect('/auth/logout');
    }

    // Tam user objesini EJS'e gönderiyoruz.
    res.render("profile", { 
        user: fullUser, 
        pageTitle: 'Profil Bilgileri'
    });
  } catch (error) {
    console.error("Profil sayfası yüklenirken hata:", error);
    res.redirect('/');
  }
});


 //Profil güncelleme

homeController.post("/profile", sessionCheckAuth, async (req, res) => {
  const { name, email, password } = req.body;
  const success = await profileUpdate(req, { name, email, password });

  if (success) {
    res.redirect("/profile");
  } else {
   console.error("Profil güncelleme hatası");
   res.redirect("/profile"); 
  }
});
// Arama rotası: url: /search?q=sorgu
homeController.get("/search", async (req, res,) => {
    
    // URL'den ?q=terim parametresini al
    const searchQuery = req.query.q as string || ''; 

    try {
        const posts = await searchPosts(searchQuery);

        // Arama sonuç sayfasını render et
        res.render('search-results', {
            pageTitle: `Arama Sonuçları: ${searchQuery}`,
            posts: posts,
            searchQuery: searchQuery, // Arama terimini sayfada göstermek için
            user: req.session.user || null // Navbar için kullanıcı bilgisini ilet
        });
        
    } catch (error) {
        console.error("Arama rotası hatası:", error);
        
    }
});

// İletişim Sayfası
homeController.get("/contact", (req, res) => {
    // Statik bir sayfa olduğu için herhangi bir servis çağırmaya gerek yok
    res.render('contact', {
        pageTitle: 'İletişim',
        user: req.session.user || null, // Navbar için kullanıcı bilgisini ilet
        // Diğer global veriler (globalCategories vb.)
    });
});
