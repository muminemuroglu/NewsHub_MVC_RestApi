import express, { NextFunction, Request, Response } from 'express'

export const globalFilter = async (req: Request, res: Response, next: NextFunction) => {
  const url = req.url
  const urls = ['/','/auth','/auth/login','/auth/register'] //Session beklenmeyen sayfalar
  let loginStatus = true
  urls.forEach((item) => {
    if(item == url) {
        loginStatus = false
    }
  })
  if (loginStatus) {
    // oturum denetimi yap
    const session = req.session.item
    if (session) {
              next()
    }else {
        res.redirect('/')
    }
  }else {
    // oturum denetimi yapma
    next() // alması gereken hizmeti alsın
  }
  
}