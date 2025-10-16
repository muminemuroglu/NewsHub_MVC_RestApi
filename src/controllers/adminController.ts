import express from 'express';

export const adminController= express.Router();

adminController.get("/",(req,res)=>{
    res.render("admin")
})