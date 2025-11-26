import CommentDB, { IComment } from "../../models/IComment";
import { FilterQuery } from "mongoose";
import mongoose from "mongoose";

// Yorum ekleme
export const addComment = async (postId: string, userId: string, content: string, isActiveStatus: boolean = false): Promise<string | true> => {
    const validationResult = commentValid(content);
    if (validationResult !== true) {
        return validationResult; 
    }
    try {
            const comment = new CommentDB({
            content,
            postId,
            userId,
            lastUpdatedById: userId,
            isActive: isActiveStatus, 
        });
        await comment.save();

        return true; // Başarı durumunda true döner
        
    } catch (error) {
        console.error("addComment error:", error);
        return "Yorum kaydedilirken beklenmedik bir sunucu hatası oluştu.";
    }
};

// Yorumu silme (Hem yorum sahibi hem Admin yetkisi)
export const deleteComment = async (commentId: string, currentUserId: string,  currentUserRole: string | null): Promise<string | false>  => {
    const comment = await CommentDB.findById(commentId);
    if (!comment) return false;

    const isOwner = comment.userId.toString() === currentUserId;// Yorum sahibinin ID'sini kontrol et
    const isAdmin = currentUserRole === 'Admin';// Kullanıcının Admin olup olmadığını kontrol et
    
    if (!isOwner && !isAdmin) {    // Silme yetkisi kontrolü: Yorum sahibi VEYA Admin olmalı.
        return false;             // Yetki yoksa silme
    }
    const postId = comment.postId.toString();// Silmeden önce Post ID'sini alıyoruz
    
const deleteResult = await comment.deleteOne();
     if(deleteResult) {                     
        return postId;  
    }
    return false;
};

// Admin tüm yorumları görür
export const getAllComments = async () => {
    return await CommentDB.find()
        .populate("userId", "name email") 
        .populate("postId", "title")
        .sort({ createdAt: -1 });
};

// Post'a ait yorumları, kullanıcının kendi yorumu onaylanmasa bile göstererek çeker.
export const getCommentsForPostDetail = async (
    postId: string, 
    currentUserId: string | null,
    currentUserRole: string | null = null 
) => {
    const commentFilter: FilterQuery<any> = { postId }; 
    if (currentUserRole !== 'Admin') { 
        if (currentUserId) {
            const userObjectId = new mongoose.Types.ObjectId(currentUserId);
            
            // Onaylı yorumları VEYA kullanıcının kendi yorumlarını göster.
            commentFilter.$or = [ 
                { isActive: true },
                { userId: userObjectId } 
            ];
        } else {
            // Giriş yapmamış kullanıcılar için sadece onaylı yorumları göster.
            commentFilter.isActive = true; 
        }
    }
    // Yorumları çekme
    return await CommentDB.find(commentFilter)
                          .populate('userId', 'name _id') 
                          .sort({ createdAt: 1 });
};


// Yorum onaylama/pasifleştirme işlemi
export const toggleCommentStatus = async (
    commentId: string, 
    targetStatus: string, 
    adminId: string
): Promise<{ success: boolean, message: string }> => {
    
    let targetIsActive: boolean;
    let actionName: string;

    if (targetStatus === 'true') {
        targetIsActive = true;
        actionName = 'onaylandı';
    } else if (targetStatus === 'false') {
        targetIsActive = false;
        actionName = 'pasifleştirildi';
    } else {
        return { success: false, message: 'HATA: Geçersiz aksiyon isteği alındı.' };
    }
    try {
        
        const updatedComment = await CommentDB.findByIdAndUpdate(
            commentId,
            {
                isActive: targetIsActive,
                lastUpdatedById: new mongoose.Types.ObjectId(adminId), 
            },
            { new: true } 
        );

        if (updatedComment) {
            return { success: true, message: `Yorum başarıyla ${actionName}.` };
        } else {
            return { success: false, message: 'HATA: Yorum bulunamadı veya işlem başarısız oldu.' };
        }

    } catch (error) {
        console.error(`toggleCommentStatus hatası (${actionName}):`, error);
        return { success: false, message: 'Kritik bir sunucu hatası oluştu.' };
    }
};            



//Yorum validasyonu
export const commentValid = (content: string): string | true => {
    if (!content) {
        return "Yorum içeriği boş bırakılamaz.";
    }
    if (content.length < 20 || content.length > 250) {
        return "Yorumunuz 20 ile 250 karakter arasında olmalıdır. Lütfen kontrol edip tekrar deneyin.";
    }
    return true;
};