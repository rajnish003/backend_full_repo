const express = require("express");
const router = express.Router();

const { 
  createUser, 
  getAllUsers, 
  not_Active_deleteUser, 
  updateUser,
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
router.delete("/users/:userId", canDelete, not_Active_deleteUser);


module.exports = router; 