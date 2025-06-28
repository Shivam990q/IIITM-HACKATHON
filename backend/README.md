# NyayChain Backend API

The backend API for the NyayChain - Blockchain Governance Platform, providing RESTful services for complaint management, user authentication, and data analytics.

## Features

- **Authentication**: User registration, login, and profile management
- **Complaints Management**: Submit, track, and update civic complaints
- **Admin Dashboard**: Assign complaints, manage officials, monitor progress
- **Analytics**: Get statistics and visualize data for decision making
- **Blockchain Integration**: Simulated blockchain recording for immutable data storage

## Tech Stack

- Node.js & Express
- MongoDB (with Mongoose ORM)
- JWT Authentication
- Multer for file uploads
- Express Validator for data validation

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── models/            # MongoDB schema models
│   ├── middleware/        # Custom middleware
│   ├── routes/            # API routes
│   ├── utils/             # Helper utilities
│   └── server.js          # Main application entry
├── uploads/               # Uploaded files storage
├── .env-example           # Environment variables example
└── package.json           # Project dependencies
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user profile

### Complaints

- `POST /api/complaints` - Submit a new complaint
- `GET /api/complaints` - List all complaints (with filters)
- `GET /api/complaints/:id` - Get a specific complaint
- `PATCH /api/complaints/:id/status` - Update complaint status
- `POST /api/complaints/:id/comments` - Add a comment to a complaint
- `PATCH /api/complaints/:id/assign` - Assign complaint to an official
- `POST /api/complaints/:id/upvote` - Upvote a complaint

### Users

- `PATCH /api/users/profile` - Update user profile
- `GET /api/users/complaints` - Get user's complaints
- `PATCH /api/users/password` - Change user password
- `GET /api/users/officials` - Get officials list (admin only)
- `POST /api/users/officials` - Create official account (admin only)

### Statistics

- `GET /api/stats/summary` - Get summary statistics
- `GET /api/stats/by-category` - Get statistics by category
- `GET /api/stats/time-series` - Get time series data
- `GET /api/stats/map-data` - Get geospatial data for map

## Getting Started

### Prerequisites

- Node.js v14+ and npm
- MongoDB running locally or connection string to MongoDB Atlas

### Installation

1. Clone the repository
2. Copy `.env-example` to `.env` and update the variables
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRES_IN`: JWT token expiration

## Blockchain Integration

The current implementation uses a simulated blockchain integration. In a production environment, this would be replaced with actual blockchain integration using libraries like Web3.js or Ethers.js connected to Ethereum, Polygon, or another blockchain. 