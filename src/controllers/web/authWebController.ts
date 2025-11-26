import  express from 'express'
import { IUser } from '../../models/IUser';
import { userLogin, userLoginDb, userRegister, userRegisterDb } from '../../services/webService/authWebService';


export const authController = express.Router();

// Login Sayfası
authController.get("/", (req, res) => {
    res.render('auth/login')
})

// Login İşlemi
authController.post("/login", async (req, res) => {
    const user: IUser = req.body;
    const isValid = userLogin(user);

    if (isValid === true) {
        const loginResult: true | string = await userLoginDb(user, req);

        if (loginResult === true) {
            const currentUser = req.session.user;

            if (!currentUser) {
                return res.render('auth/login', { error: "Session error. Try again." });
            }
            return res.redirect('/');

        } else {
            res.render('auth/login', { error: loginResult });
        }

    } else {
        res.render('auth/login', { error: isValid });
    }
});

// Register Sayfası
authController.get("/register", (req,res)=>{
    res.render('auth/register')
})

// Register İşlemi
authController.post("/register", async(req,res)=>{
   const user :IUser = req.body
   const isValid =userRegister(user);
   if(isValid===true){
    const registerDB =await userRegisterDb(user)
    if(registerDB===true){
      res.redirect('/auth')}
   }else{
    res.render('auth/register',{error:isValid})
   }
})

// Logout İşlemi
authController.get('/logout', (req, res) => {
   
    req.session.destroy((err) => {  // Session'ı öldür
        if (!err) {
            res.redirect('/')
        }
    })
})