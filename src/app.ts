import express from 'express'
import session from 'express-session'
import path from 'path'
import bodyParser from 'body-parser'
import { connectDB } from './utils/db'
import { globalFilter } from './utils/globalFilter'
import { IUser } from './models/IUser'


const app = express()
const PORT = process.env.PORT || 3000

//Session Config
declare module 'express-session'{
  interface SessionData{
    item:IUser
  }
}
const sessionConfig= session({
  secret: 'key123',
  resave :false,
  saveUninitialized:true
})
app.use(sessionConfig)

// DB Config
connectDB()

// EJS Configuration
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.static('public'));

// Body-parser Config
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Global filter
app.use(globalFilter)

//İmports Controller
import { homeController } from './controllers/homeController'
import { authController } from './controllers/authController'
import { dashboardController } from './controllers/dashboardController'
import { adminController } from './controllers/adminController'








// Controllers
app.use("/", homeController)
app.use("/auth",authController)
app.use("/admin", adminController)
app.use("/dashboard",dashboardController)




app.listen(PORT, ()=>{
    console.log(`Server running: http://localhost:${PORT}`)
})