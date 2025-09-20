# ZA\_Proj2\_Blog Backend

## Project Overview

This is the **backend API** for the ZA\_Proj2\_Blog application.
It is built with **Node.js**, **Express**, and **MongoDB**, and provides endpoints for managing blogs, including:

* Creating, updating, fetching, and deleting blogs
* Image uploads for blog posts
* Public and private blog visibility
* Authentication and authorization
* Roll based route permissions

---

## **Folder Structure**

```
blog-pf-back/
├─ src/
│  ├─ config/           # Configuration files (e.g., env variables, DB setup)
│  ├─ constants/        # Constants used throughout the app
│  ├─ controllers/      # Route controllers (blogControllers.js, etc.)
│  ├─ middleware/       # Middleware (auth, upload, asyncHandler)
│  ├─ models/           # Mongoose models (BlogModel.js, UserModel.js)
│  ├─ validators/       # Input validation logic
│  ├─ utils/            # Helper utilities (ApiError, ApiResponse)
│  ├─ services/         # Service layer if needed (optional business logic)
│  ├─ server.js         # Express server entry point
├─ uploads/             # Uploaded images (ignored by Git)
├─ package.json
├─ .gitignore
```

---

## **Installation**

1. Clone the repository:

```bash
git clone <repo-url>
cd blog-pf-back
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.development.local` file in the root (example):

```
NODE_ENV='development'
MONGO_URI=''
PORT=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=
JWT_REFRESH_EXPIRES=

CORS_ORIGIN=
COOKIE_SECURE=false
```

4. Start the server (with auto-reload):

```bash
npm run start # for --watch flag
npm run dev # for nodeman
```

---

## Auth & Token Flow

This project uses JWT + Refresh Tokens for secure authentication.

Access Token → Short-lived JWT (e.g., 15m), used for API requests.

Refresh Token → Long-lived, stored in DB + sent via secure HTTP-only cookie.

Flow:

1. User logs in → gets access + refresh token.

2. When access token expires → client requests new one using refresh token.

3. Server verifies refresh token in DB → revokes old one, issues new access + refresh token.

4. Expired/compromised tokens are auto-cleaned via MongoDB TTL.
Keeps users logged in securely, supports session revocation, and prevents token reuse.

---
## Role based routes protection
`blog-pf-back\src\constants` --> roles desigination.
`blog-pf-back\src\controllers\authController.js` --> allowedRoles(), can be implimented in routes.

---

## **API Endpoints**

### **Auth Routes**
| Method | Endpoint    | Description                | Middleware |
| ------ | ----------- | -------------------------- | ---------- |
| POST   | `/api/auth/register` | Register a new user        | –          |
| POST   | `/api/auth/login`    | Login user & issue tokens  | –          |
| POST   | `/api/auth/logout`   | Logout user & revoke token | –          |
| POST   | `/api/auth/refresh`  | Refresh access token       | –          |

### **User Routes**
| Method | Endpoint          | Description             | Middleware   |
| ------ | ----------------- | ----------------------- | ------------ |
| GET    | `/api/user/getUserProfile` | Get logged-in user info | `verifyToken` |

---

### **Public Routes**

| Method | URL                        | Description              |
| ------ | -------------------------- | ------------------------ |
| GET    | `/api/blogs/:id`           | Get single blog by ID    |
| GET    | `/api/users/:userId/blogs` | Get all blogs for a user |

### **Protected Routes** (requires JWT token)

| Method | URL                     | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| POST   | `/api/blogs/createPost` | Create a blog (supports image upload) |
| PUT    | `/api/blogs/:id`        | Update a blog                         |
| DELETE | `/api/blogs/:id`        | Delete a blog (also deletes image)    |

---

## **Image Uploads**
Temp. stored in server folder, will be changed to cloudinary.
* Image uploads are handled via **Multer**
* Images are saved in `uploads/` folder
* File path is stored in MongoDB as `image` field
* Example path: `/uploads/1694034601234.jpg`



---

## **Error Handling**

* All errors are handled globally via **asyncHandler** , **custom error middleware** and **ApiError**.
* API responses follow the `ApiResponse` format:

---

## **Git Ignore**

* The `uploads/` folder is ignored in `.gitignore`
* The `.env` folder is ignored in `.gitignore`
* Only source code and configuration are committed

---


