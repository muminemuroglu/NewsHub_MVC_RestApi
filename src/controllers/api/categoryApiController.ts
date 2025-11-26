import express from 'express'

import { JwtPayload } from 'jsonwebtoken';
import { AuthRequest, checkRole, verifyToken } from '../../middlewares/authMiddleware';
import { eRoles } from '../../utils/eRoles';
import CategoryDB, { ICategory } from '../../models/ICategory';
import { editCategory, removeCategory } from '../../services/apiService/categoryApiService';

const categoryApiController = express.Router()

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the category
 *           example: "665f1c2b9e6e4a001f8e4b1a"
 *         name:
 *           type: string
 *           description: Category name
 *           minLength: 2
 *           maxLength: 50
 *           example: "Elektronik"
 *         description:
 *           type: string
 *           description: Category description
 *           example: "Elektronik ürünler kategorisi"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-21T12:34:56.789Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-21T12:34:56.789Z"
 */

/**
 * @swagger
 * /categories/add:
 *   post:
 *     summary: Add a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *           example:
 *             name: "Kitaplar"
 *             description: "Kitap kategorisi"
 *     responses:
 *       201:
 *         description: Category added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category added successfully
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid category name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       500:
 *         description: Internal server error
 *     x-roles:
 *       - Admin
 */

/**
 * @swagger
 * /categories/list:
 *   get:
 *     summary: List categories (paginated, 10 per page)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 page:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       500:
 *         description: Internal server error
 *     x-roles:
 *       - Admin
 */

/**
 * @swagger
 * /categories/update/{id}:
 *   put:
 *     summary: Update an existing category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *           example:
 *             name: "Güncellenmiş Kategori"
 *             description: "Güncellenmiş açıklama"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Category updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid data or missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 *     x-roles:
 *       - Admin
 */

/**
 * @swagger
 * /categories/delete/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 *     x-roles:
 *       - Admin
 */




// Kategori ekleme
categoryApiController.post('/add', verifyToken, checkRole(eRoles.Admin), async (req: AuthRequest, res) => {
  try {
    const categorydata = req.body as ICategory;
    const user = req.user as JwtPayload;
    
    if (!categorydata.name || categorydata.name.length < 2 || categorydata.name.length > 50) {
      return res.status(400).json({ message: 'Invalid category name' });
    }
    const newCategory = new CategoryDB(categorydata);
    await newCategory.save();

    return res.status(201).json({ 
      message: 'Category added successfully', 
      category: newCategory 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

// Kategori listeleme (10'ar 10'ar)
categoryApiController.get('/list', verifyToken, checkRole(eRoles.Admin), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const categories = await CategoryDB.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      categories,
      page
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

//Kategori Düzenleme
categoryApiController.put("/update/:id", verifyToken, checkRole(eRoles.Admin), async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    const result = await editCategory(id,categoryData)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error })
  }
})



//Kategori Silme
categoryApiController.delete("/delete/:id",verifyToken,checkRole(eRoles.Admin), async(req,res)=>{
  try{
    const{id} = req.params;
    const result =await removeCategory(id);
    return res.status(result.code).json(result);
  }catch(error){
    return res.status(500).json({message:"Internal server error", error});
  }
})


export default categoryApiController;