# 📰 NewsHub – Node.js | TypeScript | MVC & REST API

NewsHub, **Node.js + TypeScript** ile geliştirilmiş, hem **MVC (EJS View)** hem de **REST API** yapısını aynı projede barındıran tam kapsamlı bir **Haber & Blog Platformu** uygulamasıdır.

Proje; JWT tabanlı kimlik doğrulama, session yönetimi, MongoDB modelleme, validation, global hata yönetimi ve Swagger API dokümantasyonu gibi kurumsal düzey backend konularını kapsar.

---

## 🚀 Özellikler

### 🔐 Authentication & Authorization

* User register & login
* Parola şifreleme (bcrypt)
* **REST API → JWT Authentication**
* **EJS → Session tabanlı authentication**
* Role-based access:

  * **Admin:** tüm kullanıcı ve içerikleri yönetebilir
  * **User:** kendi postlarını yönetebilir

### 📝 Post Yönetimi

* Post oluşturma, düzenleme, silme
* Post detay sayfası + yorum alanı (EJS)
* REST API üzerinden JWT korumalı post CRUD işlemleri

### 💬 Yorum Yönetimi

* Kullanıcılar postlara yorum ekleyebilir
* Yorumları yalnızca admin veya post sahibi silebilir

### 📘 Swagger API Docs

* Tüm REST API endpoint’leri dokümante edilir
* `/api-docs` adresinden erişilebilir

---

## 📁 Proje Mimarisi (Katmanlı Yapı)

```
src/
 ├── controllers/     → HTTP isteklerini karşılar
 ├── services/        → İş mantığı
 ├── models/          → Mongoose modelleri
 ├── views/           → EJS arayüzleri
 ├── middlewares/     → Auth, Upload
 ├── utils/           → JWT, bcrypt, yardımcı fonksiyonlar
 ├── app.ts           → Ana Express Uygulaması
```

---

## 🛠 Kullanılan Teknolojiler

* **Node.js + TypeScript**

* Express.js

* EJS Template Engine

* MongoDB + Mongoose

* Bcrypt

* JWT

* Express-session

* Swagger

* Global Error Filtering

*	Dotenv, Nodemon, Ts-Node, Multer

---

## 📚 REST API Endpoint’leri

### AUTH

| Endpoint                | Method | Açıklama                 | Yetki  |
| ----------------------- | ------ | ------------------------ | ------ |
| `/api/v1/auth/register` | POST   | Yeni kullanıcı oluşturur | Public |
| `/api/v1/auth/login`    | POST   | JWT üretir               | Public |
| `/api/v1/auth/profile`  | GET    | Kullanıcı bilgileri      | JWT    |
| `/api/v1/auth/refresh`  | POST   | Token yenileme           | JWT    |
| `/api/v1/auth/logout`   | POST   | Oturum sonlandırma       | JWT    |

---

## 🖥️ EJS View Sayfaları

| Sayfa        | Açıklama                  |
| ------------ | ------------------------- |
| `/login`     | Giriş sayfası             |
| `/register`  | Kullanıcı kaydı           |
| `/dashboard` | Kullanıcının postları     |
| `/posts/new` | Yeni post oluşturma       |
| `/posts/:id` | Post detay + yorum ekleme |
| `/admin`     | Admin paneli              |

---

## ⚙️ Kurulum

### 1. Repoyu klonlayın

```bash
git clone https://github.com/muminemuroglu/NewsHub_MVC_RestApi.git
cd NewsHub_MVC_RestApi
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. .env dosyasını oluşturun

#### 🔑 `.env` Örneği

```
PORT=4000

MONGO_URI=mongodb://localhost:27017/newshub

JWT_SECRET=supersecretkey
JWT_REFRESH_SECRET=refreshsecretkey
JWT_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d

SESSION_SECRET=session_secret_key

NODE_ENV=development
```

### 4. Uygulamayı başlatın

```bash
npm run dev
```

---

## 📄 Swagger Dokümantasyonu

Uygulama çalıştığında:

👉 **http://localhost:4000/api-docs**


---

## 🎯 Öğrenim Hedefleri

* MVC ve REST API yapısını aynı projede entegre etmek
* TypeScript destekli kurumsal Node.js mimarisi
* JWT & Session farklarını uygulamalı öğrenmek
* Mongoose ilişkilerini etkin kullanmak
* Swagger ile API dokümantasyonu hazırlamak

## 📸 Ekran Görüntüleri

### Anasayfa

<img width="1695" height="948" alt="Ekran Resmi 2025-11-27 03 30 17" src="https://github.com/user-attachments/assets/04bf80e5-e425-4669-ac1b-df5949c7f0de" />

### Admin Panel

<img width="1710" height="948" alt="Ekran Resmi 2025-11-27 03 31 29" src="https://github.com/user-attachments/assets/50371414-9090-4e7d-bd63-a625d9d48e1e" />

### User Panel

<img width="1709" height="942" alt="Ekran Resmi 2025-11-27 03 10 50" src="https://github.com/user-attachments/assets/a523c40e-bf7f-4a7d-b6f2-a4582e258e9c" />

### Haber Detay Sayfası

<img width="964" height="820" alt="Ekran Resmi 2025-11-27 03 13 30" src="https://github.com/user-attachments/assets/a9f87502-1e07-45a3-b574-07f265dd8c7a" />

### Swagger Docs

<img width="1709" height="949" alt="Ekran Resmi 2025-11-27 03 20 33" src="https://github.com/user-attachments/assets/19ca3804-6a4d-450e-91a1-104c2cb485f4" />

### MongoDB

<img width="1710" height="1077" alt="Ekran Resmi 2025-11-27 03 18 30" src="https://github.com/user-attachments/assets/8c3c731b-bb29-45d3-990f-98de991e77a6" />

---
## 🧾 Lisans

MIT Lisansı © 2025 — muminemuroglu

---
## 🏷️ Etiketler

`Node.js` `Express.js` `TypeScript` `EJS` `HTML` `CSS`  
`MongoDB` `Mongoose` `JWT` `bcrypt` `swagger`  
`Katmanlı Mimari` `MVC` `REST API` `RBAC` `Session Management`  
`Validation` `Project Management` `Backend Development` `API Documentation` `Full Stack` `news` `blog`
