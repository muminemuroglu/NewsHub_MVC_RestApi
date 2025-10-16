import  express from 'express'
import { IUser } from '../models/IUser';
import { userLogin, userLoginDb, userRegister, userRegisterDb } from '../services/authService';



export const authController = express.Router();

authController.get("/", (req, res) => {
    res.render('auth/login')
})

authController.post("/login", async (req, res) => {
    const user :IUser= req.body
    const isValid =userLogin(user)
    if(isValid===true){
        const userLogin= await userLoginDb(user, req)
        console.log(user)
        if(userLogin ===true){
            res.redirect('/admin')
        }else{
            res.render('auth/login', {error : userLogin})
        }
        
    }else{
        res.render('auth/login',{error:isValid})
    }
    
})

authController.get("/register", (req,res)=>{
    res.render('auth/register')
})

authController.post("/register", async(req,res)=>{
   const user :IUser = req.body
   const isValid =userRegister(user);
   if(isValid===true){
    const registerDB =await userRegisterDb(user)
    if(registerDB===true){}
      res.redirect('/auth')
   }else{
    res.render('auth/register',{error:isValid})
   }
})

authController.get('/logout', (req, res) => {
    req.session.destroy((err) => { // session nesnesi öldürüldü
        if (!err) {
            res.redirect('/')
        }
    })
})