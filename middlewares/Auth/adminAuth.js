const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");
const { hasPermission } = require("../../config/roles");
require("dotenv").config();

const extractToken = (req) => {
  return (
    req.cookies?.token ||
    req.body?.token ||
    req.header("Authorization")?.replace("Bearer ", "").trim() ||
    req.headers["x-access-token"]
  );
};

exports.checkAdminAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    console.log("Extracted token:", token ? "Token exists" : "No token");
    console.log("ADMIN_JWT_SECRET exists:", !!process.env.ADMIN_JWT_SECRET);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Use ADMIN_JWT_SECRET if available, otherwise fallback to JWT_SECRET
    const jwtSecret = process.env.ADMIN_JWT_SECRET;
    
    if (!jwtSecret) {
      console.error("Neither ADMIN_JWT_SECRET  is defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      
      console.log("Token decoded successfully:", decoded);

      // Check if user is admin
      if (decoded.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      // Verify admin exists and is active
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: "Admin account not found or inactive.",
        });
      }
      
      req.user = decoded;
      req.admin = admin;
    } catch (error) {
      console.error("Token verification error:", error.name, error.message);
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
    console.error("Admin Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

// Middleware to check specific permissions
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check if admin has the required permission
      if (!req.admin.hasPermission(permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${permission} permission required.`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during permission check",
      });
    }
  };
};

// Specific permission middlewares
exports.canCreate = exports.checkPermission('create');
exports.canRead = exports.checkPermission('read');
exports.canUpdate = exports.checkPermission('update');
exports.canDelete = exports.checkPermission('delete'); 