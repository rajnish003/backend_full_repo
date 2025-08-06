# Admin Panel Backend

A complete admin panel backend with user management functionality.

## Features

- **Admin Authentication**: Secure login for admin users
- **User Management**: Create, read, update, and delete users
- **Role-based Access**: Admin-only routes with proper authorization
- **JWT Authentication**: Secure token-based authentication
- **Admin Dashboard**: Web interface for user management

## API Endpoints

### Authentication
- `POST /v1/auth/admin-login` - Admin login

### Admin Routes (Require Admin Authentication)
- `GET /v1/admin/users` - Get all users
- `POST /v1/admin/users` - Create new user
- `PUT /v1/admin/users/:userId` - Update user
- `DELETE /v1/admin/users/:userId` - Delete user

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with:
   ```
   PORT=4000
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Create Admin User**
   ```bash
   npm run create-admin
   ```
   This will create an admin user with:
   - Email: admin@example.com
   - Password: admin123

4. **Start the Server**
   ```bash
   npm run dev
   ```

5. **Access Admin Panel**
   Open your browser and go to:
   ```
   http://localhost:4000/admin/
   ```

## Admin Panel Features

### Login
- Use the admin credentials created by the script
- Email: admin@example.com
- Password: admin123

### Dashboard
- **View Users**: See all registered users
- **Add Users**: Create new users with full name, email, and password
- **Delete Users**: Remove users from the system
- **Logout**: Secure logout functionality

## Security Features

- **JWT Token Authentication**: All admin routes require valid JWT tokens
- **Role-based Authorization**: Only users with 'admin' role can access admin routes
- **Password Hashing**: All passwords are securely hashed using bcrypt
- **Token Expiration**: Admin tokens expire after 24 hours

## File Structure

```
├── controllers/
│   ├── admin/
│   │   └── adminController.js    # Admin controller functions
│   └── Auth/
│       └── Auth.js              # User authentication
├── middlewares/
│   └── Auth/
│       ├── auth.js              # User authentication middleware
│       └── adminAuth.js         # Admin authentication middleware
├── models/
│   ├── User.js                  # User model with role support
│   └── Profile.js               # User profile model
├── routes/
│   └── v1/
│       ├── auth.js              # Authentication routes
│       └── adminRoutes.js       # Admin routes
├── public/
│   └── admin/
│       └── index.html           # Admin panel frontend
├── scripts/
│   └── createAdmin.js           # Admin user creation script
└── app.js                       # Main application file
```

## API Usage Examples

### Admin Login
```bash
curl -X POST http://localhost:4000/v1/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Get All Users (Requires Admin Token)
```bash
curl -X GET http://localhost:4000/v1/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Create User (Requires Admin Token)
```bash
curl -X POST http://localhost:4000/v1/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"fullname": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### Delete User (Requires Admin Token)
```bash
curl -X DELETE http://localhost:4000/v1/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Notes

- The admin panel is served as static files from the `/public` directory
- All admin routes require authentication with a valid admin JWT token
- Admin users cannot be deleted through the API for security reasons
- The system automatically creates user profiles when creating new users
- Passwords are hashed using bcrypt with a salt rounds of 10 