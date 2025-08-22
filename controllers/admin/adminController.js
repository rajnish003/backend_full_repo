const User = require("../../models/User");
const Admin = require("../../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Profile = require("../../models/Profile");
// const { canCreate, canRead, canUpdate, canDelete } = require("../../config/roles");

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


    // Find admin user
    const admin = await Admin.findOne({ email, isActive: true });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or admin not found",
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const payload = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    };

    const token = jwt.sign(payload, process.env.ADMIN_JWT_SECRET, {
      expiresIn: "24h", // Longer token for admin
    });

    // Remove password from response
    admin.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// Create User (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Validate input
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Fullname, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create profile
    const profileDetails = await Profile.create({
      gender: null,
      contactNumber: null,
    });

    // Create user
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${fullname}`,
      role: 'user', // Only create regular users
    });

    // Remove password from response
    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user. Please try again.",
    });
  }
};

// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .populate("additionalDetails")
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users. Please try again.",
    });
  }
};

// Delete User (Admin only)
exports.not_Active_deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user. Please try again.",
    });
  }
};

// Update User (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullname, email } = req.body;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;

    await user.save();

    // Remove password from response
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user. Please try again.",
    });
  }
};


// Create Admin (Super Admin only)
// exports.createAdmin = async (req, res) => {
//   try {
//     const { fullname, email, password, permissions } = req.body;

//     // Validate input
//     if (!fullname || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Fullname, email, and password are required",
//       });
//     }

//     // Check if admin already exists
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({
//         success: false,
//         message: "Admin with this email already exists",
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create admin with custom permissions
//     const adminData = {
//       fullname,
//       email,
//       password: hashedPassword,
//       image: `https://api.dicebear.com/5.x/initials/svg?seed=${fullname}`,
//       permissions: permissions || {
//         create: true,
//         read: true,
//         update: true,
//         delete: true
//       }
//     };

//     const admin = await Admin.create(adminData);

//     // Remove password from response
//     admin.password = undefined;

//     return res.status(201).json({
//       success: true,
//       message: "Admin created successfully",
//       admin,
//     });
//   } catch (error) {
//     console.error("Create admin error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create admin. Please try again.",
//     });
//   }
// };

// // Get All Admins
// exports.getAllAdmins = async (req, res) => {
//   try {
//     const admins = await Admin.find({ isActive: true })
//       .select("-password");

//     return res.status(200).json({
//       success: true,
//       message: "Admins retrieved successfully",
//       admins,
//       count: admins.length,
//     });
//   } catch (error) {
//     console.error("Get admins error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve admins. Please try again.",
//     });
//   }
// }; 