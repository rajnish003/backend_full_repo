const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser')

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;


//body parser
app.use(bodyParser.urlencoded())

// parse application/json
app.use(bodyParser.json())

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded
app.use(cookieParser()); // when we 

// Database connection
require("./config/dbConnection").connect();

// Routes
// const mqttRoute = require("./routes/v1/mqttRoutes")

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON payload" });
  }
  next();
});

const authRoutes = require("./routes/v1/auth"); // Exported as router directly
const adminRoutes = require("./routes/v1/adminRoutes")
app.use("/v1/auth", authRoutes); // Prefix /v1/auth for all auth-related endpoints
app.use("/v1/admin", adminRoutes);
// app.use("/v1/mqtt", mqttRoute); // Prefix /v1/mqtt for all auth-related endpoints



// Start the server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
