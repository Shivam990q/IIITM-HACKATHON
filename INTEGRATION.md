# Frontend-Backend Integration Guide for NyayChain

This document provides comprehensive instructions on integrating the frontend React application with the Node.js/Express backend.

## Architecture Overview

The NyayChain application follows a client-server architecture:

- **Frontend**: React application with TypeScript, built using Vite
- **Backend**: Node.js/Express API with MongoDB database
- **Integration Layer**: API services in the frontend that communicate with backend endpoints

## Setup Instructions

### 1. Running the Backend

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env-example .env

# Edit the .env file with your MongoDB connection string and other configurations

# Start the development server
npm run dev
```

The backend server will run on port 5000 by default (http://localhost:5000).

### 2. Configure Frontend API Integration

The frontend is already set up to communicate with the backend through the `src/services/api.ts` file. By default, it points to `http://localhost:5000/api`. If you need to change this:

```typescript
// src/services/api.ts
const API_BASE_URL = 'http://your-backend-url/api';
```

### 3. Running the Frontend

```bash
# In the project root directory
npm install

# Start the development server
npm run dev
```

The frontend will run on port 8050 by default (http://localhost:8050).

## API Integration Points

### Authentication

The frontend uses `AuthContext.tsx` to manage authentication state and connects to the backend through `authService`:

```typescript
// src/components/auth/AuthContext.tsx
import { authService } from '@/services/api';

// ... in the component
const login = async (email, password) => {
  try {
    const response = await authService.login(email, password);
    // Handle successful login
  } catch (error) {
    // Handle error
  }
};
```

### Complaints Management

Complaint submission and retrieval are handled through `complaintService`:

```typescript
// Example usage in a component
import { complaintService } from '@/services/api';

// Submit a complaint
const handleSubmit = async (formData) => {
  try {
    const response = await complaintService.createComplaint(formData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### User Profile Management

User profile updates use `userService`:

```typescript
// Example usage in a component
import { userService } from '@/services/api';

// Update user profile
const updateProfile = async (userData) => {
  try {
    const updatedUser = await userService.updateProfile(userData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Statistics and Dashboard Data

Dashboard statistics are retrieved through `statsService`:

```typescript
// Example usage in a component
import { statsService } from '@/services/api';

// Get dashboard stats
const fetchStats = async () => {
  try {
    const stats = await statsService.getSummary();
    // Update state with stats
  } catch (error) {
    // Handle error
  }
};
```

## Token Management

The frontend handles authentication tokens automatically:

1. On login/register, the token is stored in localStorage
2. The API service includes the token in all subsequent requests
3. On logout, the token is removed

## Error Handling

The API services include error handling that you can extend in your components:

```typescript
try {
  const data = await someApiCall();
  // Handle success
} catch (error) {
  // You can check error properties
  if (error.status === 401) {
    // Handle unauthorized
  } else if (error.status === 404) {
    // Handle not found
  } else {
    // General error handling
    console.error('Error:', error.message);
  }
}
```

## CORS Configuration

The backend is configured to accept requests from the frontend. If you encounter CORS issues, check that:

1. The backend `cors` middleware is properly configured
2. Your frontend is sending requests to the correct URL
3. The frontend includes the proper headers

## Environment-Specific Configuration

For different environments (development, production):

### Backend

Use the `NODE_ENV` environment variable:

```
NODE_ENV=production
```

### Frontend

Use Vite's environment variables:

```
# .env.production
VITE_API_URL=https://production-api.example.com/api
```

Then update the API service:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check that tokens are properly stored and sent in requests
2. **CORS Errors**: Verify the backend CORS configuration
3. **API Connection Issues**: Confirm the backend server is running and accessible
4. **Data Format Errors**: Ensure the frontend is sending data in the format expected by the backend

### Debugging Tools

- Use browser developer tools to inspect network requests
- Check browser console for JavaScript errors
- Use API testing tools like Postman to test backend endpoints directly
- Review backend server logs for errors

## Next Steps for Production Deployment

1. Set up proper environment variables for production
2. Configure secure HTTPS connections
3. Set up proper domain names
4. Implement rate limiting and additional security measures
5. Consider setting up a CI/CD pipeline for automated deployment 