# Raino Cars Backend Deployment Guide

## 🚀 Deployment Overview
This backend is designed to be deployed on any Node.js compatible environment (VPS, PaaS).

### 1. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
- `PORT`: Default 5000
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `JWT_ACCESS_SECRET`: A long random string.
- `JWT_REFRESH_SECRET`: Another long random string.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: From your Cloudinary dashboard.
- `CLIENT_URL`: The URL where your frontend is hosted (e.g., `https://rainocars.com`).

### 2. Deployment Steps (Generic VPS / DigitalOcean / Hostinger)
1. **Clone the Repository**: `git clone <repo_url>`
2. **Install Dependencies**: `npm install`
3. **Build the Project**: `npm run build`
4. **Set up Process Manager (PM2)**:
   - Install PM2: `npm install -g pm2`
   - Start the app: `pm2 start dist/server.js --name raino-backend`
   - Save the process: `pm2 save`
5. **Reverse Proxy (Nginx)**:
   - Configure Nginx to forward requests from port 80/443 to port 5000.

### 3. Platform Specifics
- **Railway / Render**: 
  - Connect your GitHub repo.
  - Set the Build Command to `npm run build`.
  - Set the Start Command to `npm start`.
  - Add the environment variables in the "Variables" tab.
- **MongoDB Atlas**:
  - Create a cluster.
  - Whitelist the IP address of your server (or allow `0.0.0.0/0` for PaaS).
  - Create a database user and get the connection string.
- **Cloudinary**:
  - Create a free account.
  - Enable "Unsigned uploads" if needed, or use the API keys provided in the config.

### 4. Maintenance
- **Logs**: Use `pm2 logs` to monitor the server in real-time.
- **Restarts**: `pm2 restart raino-backend` after updating code.
