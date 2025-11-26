import express from 'express';
import { addCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from '../../services/webService/categoryWebService';
import { ICategory } from '../../models/ICategory';

export const categoryController= express.Router();

// Tüm kategorileri listeleme-Admin Paneli (URL: /admin/categories)
categoryController.get("/", async (req, res) => {
  const categories = await getAllCategories();
  const arr = categories ?? [];
  res.render("admin", { categories: arr });
});


// Yeni kategori ekleme (URL: /admin/categories/add)
categoryController.post("/add", async (req, res) => {
  const category: ICategory = req.body;
  const status = await addCategory(category);
  
  if (status === true) {
    return res.redirect("/admin"); 
  } else {
    console.error("Kategori Ekleme Hatası:", status);
    return res.redirect("/admin");
  }
});

// Kategori Silme (URL: /admin/categories/delete/:id)
categoryController.get("/delete/:id", async (req, res) => {
  const categoryID = req.params.id;
  await deleteCategory(req, categoryID); 
  return res.redirect("/admin"); 
});

// Kategori Güncelleme (URL: /admin/categories/update/:id)
categoryController.post('/update/:id',async(req, res)=>{
    const category:Partial<ICategory> =req.body
    const categoryID = req.params.id
    const status = await updateCategory(categoryID,category)
    if(status === true) {
        return res.redirect('/admin');
    } else {
        console.error("Kategori Güncelleme Hatası:", status);
        return res.redirect('/admin');
    }
})


// Kategori Düzenleme Sayfasını Açma (URL: /admin/categories/edit/:id)
categoryController.get('/edit/:id', async (req, res) => {
  const categoryID = req.params.id;
  const category = await getCategoryById(categoryID);
  
  if (category == null) {
    //  Kategori bulunamazsa /admin'e yönlendiriliyor.
    res.redirect('/admin');
  } else {
    // 'categoryUpdate' EJS şablonunu render ediliyor ve kategori verisini gönderiyor.
    res.render('admin', { category });
  }
});
