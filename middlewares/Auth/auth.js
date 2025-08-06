const jwt = require("jsonwebtoken");
require("dotenv").config();

const extractToken = (req) => {
  return (
    req.cookies?.token ||
    req.body?.token ||
    req.header("Authorization")?.replace("Bearer ", "").trim() ||
    req.headers["x-access-token"]
  );
};

exports.checkAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      const messages = {
        TokenExpiredError: "Token has expired",
        JsonWebTokenError: "Invalid token",
        NotBeforeError: "Token not active yet",
      };

      return res.status(401).json({
        success: false,
        message: messages[error.name] || "Token verification failed",
      });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};


