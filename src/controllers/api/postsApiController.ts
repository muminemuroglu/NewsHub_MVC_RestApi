import express from 'express'
import { JwtPayload } from 'jsonwebtoken';
import { AuthRequest, checkRole, verifyToken } from '../../middlewares/authMiddleware';
import { eRoles } from '../../utils/eRoles';
import { addPosts, postsListAll, removePosts, searchPosts, updatePosts } from '../../services/apiService/postsApiService';

const postsApiController = express.Router()

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Posts management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Posts:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the news
 *           example: "665f1c2b9e6e4a001f8e4b1b"
 *         title:
 *           type: string
 *           description: News title
 *           minLength: 2
 *           maxLength: 100
 *           example: "New Product Launch"
 *         content:
 *           type: string
 *           description: News content
 *           example: "We are excited to announce our new product..."
 *         author:
 *           type: string
 *           description: Author user id
 *           example: "665f1c2b9e6e4a001f8e4b1c"
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
 * /posts/add:
 *   post:
 *     summary: Add posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Product Launch"
 *               content:
 *                 type: string
 *                 example: "We are excited to announce our new product..."
 *               categoryId:        # ← DOĞRU HİZA
 *                 type: string
 *                 example: "665f1c2b9e6e4a001f8e4b1d"
 *     responses:
 *       201:
 *         description: Posts created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Posts'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin or Customer role required)
 *       500:
 *         description: Internal server error
 *     x-roles:
 *       - Admin
 *       - Customer
 */

/**
 * @swagger
 * /posts/update/{id}:
 *   put:
 *     summary: Update posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated News Title"
 *               content:
 *                 type: string
 *                 example: "Updated content..."
 *     responses:
 *       200:
 *         description: Posts updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Posts'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 *     x-roles:
 *       - Admin
 */

/**
 * @swagger
 * /posts/delete/{id}:
 *   delete:
 *     summary: Delete posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Posts ID
 *     responses:
 *       200:
 *         description: Posts deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Posts not found
 *       500:
 *         description: Internal server error
 *     x-roles:
 *       - Admin
 */

/**
 * @swagger
 * /posts/list:
 *   get:
 *     summary: List posts (paginated, 10 per page)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of news
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Posts'
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
 * /posts/search:
 *   get:
 *     summary: Search posts by query string
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Posts'
 *                 page:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin or User role required)
 *       500:
 *         description: Internal server error
 *     x-roles:
 *       - Admin
 *       - User
 */

// Haber Ekleme
postsApiController.post("/add", verifyToken, checkRole(eRoles.Admin, eRoles.Customer), async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const user = req.user as JwtPayload;
    const result = await addPosts(data, user.id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});

// Haber Güncelleme
postsApiController.put("/update/:id", verifyToken, checkRole(eRoles.Admin), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await updatePosts(id, data)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error })
  }
})
// Haber Silme
postsApiController.delete("/delete/:id", verifyToken, checkRole(eRoles.Admin), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await removePosts(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});

// Haber Listeleme
postsApiController.get("/list", verifyToken, checkRole(eRoles.Admin), async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await postsListAll(page, limit);
        return res.status(result.code).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
});

// Haber Arama
postsApiController.get("/search", verifyToken, checkRole(eRoles.Admin, eRoles.User), async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const result = await searchPosts(q, page, 10);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});


export default postsApiController