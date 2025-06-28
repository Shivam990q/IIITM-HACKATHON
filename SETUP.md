# NyayChain Development Setup

This guide will help you set up the complete NyayChain application with both frontend and backend.

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Git**

## Quick Setup

### 1. Install Dependencies

Run this command from the root directory to install all dependencies:

```bash
npm run install:all
```

### 2. Configure Environment

The backend `.env` file has been created with default values. Update it if needed:

```
# Backend Environment Variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nyaychain
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=30d
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
mongod
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run the Application

**Option A: Run Frontend and Backend Together**
```bash
npm run dev:full
```

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/health

## Features Fixed

✅ **Authentication Integration**
- Real JWT token-based authentication
- Proper user registration and login
- Token storage and validation
- Session persistence

✅ **API Integration**
- Real API endpoints for complaints
- File upload functionality
- Proper error handling
- CORS configuration

✅ **Database Integration**
- MongoDB connection
- User and Complaint models
- Data validation
- Geospatial indexing

✅ **Form Integration**
- ComplaintForm now submits to real API
- Image upload functionality
- Location capture
- Progress tracking

✅ **Security**
- JWT token protection
- Password hashing
- File upload validation
- CORS protection

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get user profile

### Complaints
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints` - List complaints
- `GET /api/complaints/:id` - Get complaint details
- `POST /api/complaints/:id/upvote` - Upvote complaint
- `POST /api/complaints/:id/comments` - Add comment

### Statistics
- `GET /api/stats/summary` - Get summary stats
- `GET /api/stats/by-category` - Get category stats
- `GET /api/stats/map-data` - Get map data

## Development Scripts

- `npm run dev` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run dev:full` - Start both frontend and backend
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production

## Database Models

### User
- Authentication and profile management
- Role-based access (citizen, admin, official)

### Complaint
- Complete complaint lifecycle
- Geospatial location data
- Status tracking and comments
- Blockchain transaction simulation

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Update API_BASE_URL in frontend/src/services/api.ts

3. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits

4. **CORS Errors**
   - Ensure frontend URL is in CORS whitelist
   - Check browser developer tools for specific errors

### Reset Database
```bash
# Connect to MongoDB and drop the database
mongosh
use nyaychain
db.dropDatabase()
```

## Production Deployment

1. Update environment variables for production
2. Change JWT_SECRET to a secure random string
3. Update MongoDB URI for production database
4. Build frontend: `npm run build`
5. Serve static files from backend
6. Use process manager like PM2 for backend

## Additional Features

The application includes:
- Real-time complaint tracking
- Blockchain transaction simulation
- Geographic visualization
- Role-based access control
- File upload and management
- Responsive design
- Modern UI/UX
