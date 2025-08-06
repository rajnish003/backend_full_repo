// Role definitions for the application

const roles = {
  admin: {
    can: ['create', 'read', 'update', 'delete'],
    description: 'Admin can create, read, update, and delete resources.',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true
    }
  },
  user: {
    can: ['read'],
    description: 'User can only read resources.',
    permissions: {
      create: false,
      read: true,
      update: false,
      delete: false
    }
  }
};

// Helper functions for role checking
const hasPermission = (role, permission) => {
  return roles[role] && roles[role].permissions[permission] || false;
};

const canCreate = (role) => hasPermission(role, 'create');
const canRead = (role) => hasPermission(role, 'read');
const canUpdate = (role) => hasPermission(role, 'update');
const canDelete = (role) => hasPermission(role, 'delete');

module.exports = {
  roles,
  hasPermission,//3
  canCreate,
  canRead,
  canUpdate,
  canDelete
};
