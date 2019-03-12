module.exports = [
  {
    role: {
      name: 'Global Admin',
      slug: 'global_admin'
    },
    permissions: {
      slug: 'adminForm',
      actions: ['read', 'create', 'update', 'delete']
    }
  },
 {
    role: {
      name: 'Global Admin',
      slug: 'global_admin'
    },
    permissions: {
      slug: 'userForm',
      actions: ['read', 'create', 'update', 'delete']
    }
  },
  {
     role: {
       name: 'Base User',
       slug: 'base_user'
     },
     permissions: {
       slug: 'userForm',
       actions: ['read', 'create', 'update']
     }
   },
]
