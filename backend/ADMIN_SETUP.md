# Admin Setup for NyayChain

This document provides instructions for setting up and using the admin functionality in NyayChain.

## Initial Setup

To initialize the admin user in the database, follow these steps:

1. Make sure MongoDB is running and properly configured in your `.env` file.
2. Run the initialization script:

```bash
npm run init-admin
```

This will create an admin user with the following credentials:
- Email: admin@nyaychain.com
- Password: admin123

**Important:** For production environments, you should change the default password immediately after the first login.

## Admin API Endpoints

The following API endpoints are available for admin functionality:

### Authentication

- `POST /api/auth/admin/login`: Admin login endpoint
  - Request body: `{ "email": "admin@nyaychain.com", "password": "admin123" }`
  - Response: JWT token and admin user data

- `POST /api/auth/logout`: Logout endpoint (works for both admin and regular users)

### User Management

- `GET /api/users/officials`: Get all officials (admin only)
- `POST /api/users/officials`: Create a new official (admin only)
  - Request body: `{ "name": "Official Name", "email": "official@example.com", "password": "password123" }`

### Complaint Management

- `PATCH /api/complaints/:id/status`: Update complaint status (admin/official only)
  - Request body: `{ "status": "in-progress", "comment": "Working on this issue" }`

- `PATCH /api/complaints/:id/assign`: Assign complaint to an official (admin only)
  - Request body: `{ "officialId": "official_user_id" }`

## Admin Frontend

The admin frontend is accessible at `/admin/login`. After successful login, you will be redirected to the admin dashboard at `/admin/dashboard`.

The admin dashboard includes the following sections:
- Dashboard: Overview of system statistics
- Complaints: Manage and respond to citizen complaints
- Officials: Manage government officials
- Analytics: View system analytics
- Profile: Admin profile settings

## Security Notes

1. All admin routes are protected with JWT authentication and role-based access control.
2. Only users with the 'admin' role can access admin endpoints.
3. The admin creation endpoint should be disabled in production after the initial setup.
4. Always use HTTPS in production environments to secure data transmission. 