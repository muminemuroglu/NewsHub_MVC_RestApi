import  express from 'express'


export const homeController = express.Router();
 
homeController.get("/",(req,res)=>{
    res.render("home")
})