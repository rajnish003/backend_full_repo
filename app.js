const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

// Database connection
require("./config/dbConnection").connect();

// Routes
const authRoutes = require("./routes/v1/auth"); // Exported as router directly
app.use("/v1/auth", authRoutes); // Prefix /v1/auth for all auth-related endpoints

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
