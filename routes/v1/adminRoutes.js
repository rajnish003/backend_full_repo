const express = require("express");
const router = express.Router();

const { 
  createUser, 
  getAllUsers, 
  deleteUser, 
  updateUser,
  createAdmin,
  getAllAdmins
} = require("../../controllers/admin/adminController");

const { 
  checkAdminAuth, 
  canCreate, 
  canRead, 
  canUpdate, 
  canDelete 
} = require("../../middlewares/Auth/adminAuth");

// Admin routes - all require admin authentication
router.use(checkAdminAuth);

// User management routes with permission checks
router.get("/users", canRead, getAllUsers);
router.post("/users", canCreate, createUser);
router.put("/users/:userId", canUpdate, updateUser);
router.delete("/users/:userId", canDelete, deleteUser);

// Admin management routes (super admin only)
router.get("/admins", canRead, getAllAdmins);
router.post("/admins", canCreate, createAdmin);

module.exports = router; 