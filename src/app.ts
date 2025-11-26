import express from 'express'
import session from 'express-session'
import path from 'path'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from './utils/db'
import { globalFilter } from './utils/globalFilter'
import { eRoles } from './utils/eRoles'
import { sessionCheckAuth, sessionCheckRole } from './middlewares/authMiddleware'
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from './utils/swaggerOptions'


//Dotenv Config
dotenv.config({path: path.resolve(__dirname, '../.env')});

const app = express()
const PORT = process.env.PORT || 4000
const url = `http://localhost:${PORT}`

//Session Config
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      name: string;
      role: eRoles | string;
    };
  }
}

const sessionConfig= session({
  secret: 'key123',
  resave :false,
  saveUninitialized:true,
  cookie: {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 // 1 gün
  }
})
app.use(sessionConfig)

// DB Config
connectDB()

// EJS Configuration
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.static('public'));

//Cookie-parser Config
app.use(cookieParser()) 

// Body-Parser Config
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Global filter
app.use(globalFilter)

// Imports Rest Controllers
import userApiController from './controllers/api/userApiController'
import categoryApiController from './controllers/api/categoryApiController'
import commentApiController from './controllers/api/commentApiController'
import postsApiController from './controllers/api/postsApiController'

// Routers Config
app.use('/api/v1/users', userApiController)
app.use('/api/v1/categories', categoryApiController)
app.use('/api/v1/comments', commentApiController)
app.use('/api/v1/posts', postsApiController) 

// Imports Controller
import { homeController } from './controllers/web/homeWebController'
import { authController } from './controllers/web/authWebController'
import { dashboardController } from './controllers/web/dashboardWebController'
import { adminController } from './controllers/web/adminWebController'
import { categoryController } from './controllers/web/categoryWebController'
import { commentController } from './controllers/web/commentWebContoller'



// Controllers
app.use("/", homeController)
app.use("/auth",authController)
app.use("/admin", sessionCheckAuth, sessionCheckRole(eRoles.Admin), adminController);
app.use("/admin/categories",sessionCheckAuth, sessionCheckRole(eRoles.Admin),categoryController);
app.use("/dashboard", sessionCheckAuth, dashboardController)
app.use("/comments", commentController);



// Swagger config
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.listen(PORT, () => {
  console.log(`Server running: ${url}`)
})