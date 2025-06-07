const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    // Extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    // If token is missing
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode; // attach user info to request
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    next(); // allow request to proceed
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};
