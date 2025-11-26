import { Request, Response, NextFunction } from "express";
import { eRoles } from "../utils/eRoles";
import { getAllCategories } from "../services/webService/categoryWebService";

export const globalFilter = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.session.user;

    //Session verilerini res.locals'a atıyoruz
    if (user) {
        res.locals.isLoggedIn = true;
        res.locals.user = {
            id: user.id,
            username: user.name,
            role: user.role
        };
        res.locals.isAdmin = user.role.toLowerCase() === eRoles.Admin.toLowerCase(); // Admin kontrolü
    } else {
        res.locals.isLoggedIn = false;
        res.locals.user = null;
        res.locals.isAdmin = false;
    }

    //Kategorileri çek ve res.locals'a ekle
    try {
        const globalCategories = await getAllCategories();
        res.locals.globalCategories = globalCategories;
    } catch (error) {
        console.error("Global Filter Kategori Çekme Hatası:", error);
        res.locals.globalCategories = [];
    }

    res.locals.eRoles = eRoles;

     
    // Aktif sayfa adını belirleme;req.path'teki baştaki '/' işaretini kaldırırız.
    const path = req.path.replace('/', '');
    
    // Eğer yol sadece "/" ise (ana sayfa), path değişkeni boş kalır.
    // Bu durumda page_name'i 'home' olarak ayarlıyoruz. Diğer durumlarda path'i kullanıyoruz.
    res.locals.page_name = path || 'home';

    next();
};
