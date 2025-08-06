const { default: mongoose } = require("mongoose");

const adminSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        allowNull: false,
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    permissions: {
        create: { type: Boolean, default: true },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, { timestamps: true });

// Add methods for admin-specific operations
adminSchema.methods.hasPermission = function(permission) {
    return this.permissions[permission] || false;
};

adminSchema.methods.canCreate = function() {
    return this.hasPermission('create');
};

adminSchema.methods.canRead = function() {
    return this.hasPermission('read');
};

adminSchema.methods.canUpdate = function() {
    return this.hasPermission('update');
};

adminSchema.methods.canDelete = function() {
    return this.hasPermission('delete');
};

module.exports = mongoose.model("Admin", adminSchema); 