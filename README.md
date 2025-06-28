# NyayChain - Blockchain Governance Platform

NyayChain is a governance platform that allows citizens to submit and track complaints, and enables government officials to manage and respond to these complaints.

## Features

- **Citizen Portal**: Submit and track complaints, view status updates, and provide feedback
- **Admin Dashboard**: Comprehensive dashboard for administrators to manage the platform
- **Official Interface**: Dedicated interface for government officials to respond to complaints
- **Blockchain Integration**: Transparent and immutable record-keeping of all activities

## Project Structure

The project is divided into two main parts:

- **Frontend**: React application with TypeScript, built with Vite and styled with Tailwind CSS
- **Backend**: Node.js/Express API with MongoDB database

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nyaychain.git
cd nyaychain
```

2. Install dependencies for both frontend and backend:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Update the MongoDB URI and other configuration values

4. Initialize the admin user:
```bash
npm run init-admin
```

## Running the Application

### Development Mode

To run both frontend and backend in development mode:

```bash
npm start
```

This will start:
- Backend server at http://localhost:5000
- Frontend development server at http://localhost:5173

### Running Separately

To run the backend only:
```bash
npm run backend
```

To run the frontend only:
```bash
npm run frontend
```

## User Roles

The application supports three user roles:

1. **Citizen**: Regular users who can submit and track complaints
2. **Admin**: System administrators with full access to all features
3. **Official**: Government officials who can respond to complaints

## Admin Access

The admin interface is accessible at `/admin/login` with the following default credentials:
- Email: admin@nyaychain.com
- Password: admin123

For more information about the admin functionality, see [ADMIN_SETUP.md](backend/ADMIN_SETUP.md).

## License

This project is licensed under the ISC License. 