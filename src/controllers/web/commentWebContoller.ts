import express, { Request, Response, NextFunction } from 'express';
import { addComment, deleteComment, getCommentsForPostDetail } from '../../services/webService/commentWebService';
import { getPublicPostById } from '../../services/webService/postWebService';
import { sessionCheckAuth } from '../../middlewares/authMiddleware';


export const commentController = express.Router();



// Yorumu ekler (URL: /comments/add/:postId) - Kullanıcı Yetkisi
commentController.post("/add/:postId", sessionCheckAuth, async (req: Request, res: Response) => {
    
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.session.user!;
    
    // Yorum sayfasının render edilebilmesi için Post detayını önceden çekme
    // (Render etme ihtiyacımız olduğu için)
    const post = await getPublicPostById(postId); 
    
    if (!post) {
        return res.redirect('/'); 
    }
    
    try {
        const result = await addComment(postId, user.id, content, user.role === 'Admin');
        
        if (result !== true) {
            const comments = await getCommentsForPostDetail(postId, user.id, user.role);
            return res.render(`posts/post-detail`, { 
                post: post, 
                comments: comments, 
                user: user,
                error: result as string 
            }); 
        }
        return res.redirect(`/posts/${postId}`);

    } catch (error) {
        console.error("Yorum ekleme hatası:", error);
    }
});

// Yorum siler (URL: /comments/delete/:commentId) - Kullanıcı Yetkisi
commentController.post("/delete/:commentId", sessionCheckAuth, async (req: Request, res: Response, ) => {
    try {
        const { commentId } = req.params;
        const user = req.session.user!;
        
       const postId = await deleteComment(commentId, user.id, user.role);
        
        if (!postId) {
         
            // ('Yorumu silme yetkiniz yok veya yorum bulunamadı.');
            return res.redirect('/'); // Ana sayfaya yönlendirilebilir
        }
        //Başarılı silme sonrası, servisten gelen ID ile kesin yönlendirme
        
        return res.redirect(`/posts/${postId}`);

    } catch (error) {
        console.error("Yorum silme hatası:", error);
        
    }
});