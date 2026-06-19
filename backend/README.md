# Raino Cars - OTP Email Verification Backend

A production-ready, highly secure, and deployment-ready Node.js & Express.js backend system for email OTP verification, passwordless user registration, secure session generation (JWT), and forgot-password recovery.

---

## Technical Features

- **Mongoose User Schema:** Fully stores verification codes, timestamps, and verification status.
- **Secure OTP Generator:** Generates cryptographically secure, 6-digit numeric verification codes using Node.js's built-in `crypto` module.
- **Gmail SMTP Nodemailer Transporter:** Ready-to-go mailing configurations. Handles local dev testing by logging OTP codes to the console if credentials are empty.
- **Input Sanitization & Validation:** Express validation utilizing `validator` to enforce correct formats on signup details, login metrics, and OTP shapes.
- **Brute Force Protection:** Configured with `helmet` headers, `cors` restrictions, and `express-rate-limit` to prevent brute force attacks on auth/verification endpoints.
- **OTP Resend Cooldown:** Server-enforced, precision 60-second timer restriction to prevent email spamming.
- **Custom HTML Email Templates:** Professional responsive HTML structures styled using the **Raino Cars** color scheme (Red `#ef4444`, Black `#000000`, and White `#ffffff`).

---

## Installation & Setup

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root of the `backend/` directory (already created for you) and configure the variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000

   # Nodemailer Configurations (Gmail App Passwords)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

---

## API Documentation

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@gmail.com",
    "password": "Password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```

### 2. Verify Email
- **Endpoint:** `POST /api/auth/verify-email`
- **Body:**
  ```json
  {
    "email": "johndoe@gmail.com",
    "otp": "583912"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "60d0fe2c...",
      "name": "John Doe",
      "email": "johndoe@gmail.com",
      "isVerified": true
    }
  }
  ```

### 3. Resend OTP
- **Endpoint:** `POST /api/auth/resend-otp`
- **Body:**
  ```json
  {
    "email": "johndoe@gmail.com"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "OTP resent successfully"
  }
  ```
- **Response (Cooldown Active - 429 Too Many Requests):**
  ```json
  {
    "success": false,
    "message": "Please wait 45 seconds before resending another OTP."
  }
  ```

### 4. Login User
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "johndoe@gmail.com",
    "password": "Password123"
  }
  ```
- **Response (Verified):**
  ```json
  {
    "success": true,
    "token": "eyJhbGci...",
    "user": {
      "id": "60d0fe2c...",
      "name": "John Doe",
      "email": "johndoe@gmail.com",
      "isVerified": true
    }
  }
  ```
- **Response (Unverified - 403 Forbidden):**
  ```json
  {
    "success": false,
    "message": "Please verify your email first"
  }
  ```

### 5. Request Password Reset OTP
- **Endpoint:** `POST /api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "johndoe@gmail.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Reset OTP sent successfully"
  }
  ```

### 6. Reset Password
- **Endpoint:** `POST /api/auth/reset-password`
- **Body:**
  ```json
  {
    "email": "johndoe@gmail.com",
    "otp": "129843",
    "password": "NewSecurePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset successfully. You can now login."
  }
  ```

---

## Next.js 15 Integration Examples

Below are front-end API service scripts matching Next.js 15 App Router standard calls using `fetch`:

### Auth API Service Client (`libs/api.js`)
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const register = async (name, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

export const verifyEmail = async (email, otp) => {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return res.json();
};

export const resendOtp = async (email) => {
  const res = await fetch(`${API_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const resetPassword = async (email, otp, password) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, password }),
  });
  return res.json();
};
```

---

## Production Deployment Instructions

### 1. MongoDB Atlas Setup
- Create a Cluster on MongoDB Atlas.
- In **Database Access**, create a user with read/write credentials.
- In **Network Access**, whitelist `0.0.0.0/24` (or your platform's outgoing IPs) to allow incoming connections.
- Retrieve the connection URI and paste it in the `.env` settings.

### 2. Gmail App Password Configuration
- Log into your Google Account.
- Enable **2-Step Verification**.
- Navigate to Google Account Search -> Type **"App Passwords"**.
- Create a new app (Select: "Other", Name: "Raino Cars").
- Copy the generated 16-character code (paste into `.env` under `EMAIL_PASSWORD`).

### 3. Deploying to Render
- Create a new **Web Service** on Render.
- Connect your GitHub repository.
- Specify the **Root Directory** as `backend`.
- Build Command: `npm install`
- Start Command: `npm start`
- Add all variables from `.env` directly to Render's **Environment Variables** configuration panel.
- Save and deploy!
