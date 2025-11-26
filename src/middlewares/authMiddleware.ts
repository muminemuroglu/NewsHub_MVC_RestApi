import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { eRoles } from "../utils/eRoles";
import { jsonResult } from "../models/IResult";

 
export const SECRET_KEY = process.env.SECRET_KEY || "your_secret";

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

// =========================================================
// WEB (EJS) TABANLI YETKİLENDİRME FONKSİYONLARI (Session kullanır)
// =========================================================

// sessionCheckAuth: Web (EJS) için Session oturumunu kontrol eder.Kullanıcı giriş yapmamışsa /auth/login'e yönlendirir.

export function sessionCheckAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.user) {
        return res.redirect("/auth/login");
    }
    next();
}

// sessionCheckRole: Web (EJS) için Session içindeki rolleri kontrol eder.Gerekli role sahip değilse /dashboard'a yönlendirir.
 
export function sessionCheckRole(...roles: eRoles[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.session.user?.role;

        if (!userRole || !roles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())) {
            return res.redirect("/dashboard");
        }

        next();
    };
}

// =========================================================
//  API (REST) TABANLI YETKİLENDİRME FONKSİYONLARI (JWT kullanır)
// =========================================================

// verifyToken (JWT Tabanlı): header Authorization: Bearer <token> veya cookie 'token' üzerinden token okur.
 
export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const tokenFromHeader = authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const token = tokenFromHeader || (req.cookies && req.cookies.token);
  const isApi = req.originalUrl.startsWith("/api/");

  if (!token) {
    if (isApi) {
      return res.status(403).json(jsonResult(403, false, "Token empty!", null));
    }
    return res.redirect("/auth/login"); 
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      if (isApi) {
        return res.status(403).json(jsonResult(403, false, "Token invalid!", null));
      }
      return res.redirect("/auth/login");
    }
    req.user = user;
    next();
  });
}

//checkRole (JWT Tabanlı): verilen rollere sahip mi kontrol eder.

export function checkRole(...roles: eRoles[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const isApi = req.originalUrl.startsWith("/api/");
    const user = req.user as JwtPayload | undefined;

    if (!user) {
      if (isApi) return res.status(403).json(jsonResult(403, false, "Token missing!", null));
      return res.redirect("/auth/login"); 
    }

    const userRoles = (user.roles || []) as string[];
    const hasRole = userRoles
      .map(r => r.toLowerCase())
      .some(r => roles.map(rr => rr.toLowerCase()).includes(r));

    if (!hasRole) {
      if (isApi) return res.status(403).json(jsonResult(403, false, "You do not have permission for this action", null));
      return res.redirect("/dashboard");
    }

    next();
  };
}
