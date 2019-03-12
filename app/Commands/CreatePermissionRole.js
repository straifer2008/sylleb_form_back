'use strict'

const {
  Command
} = require('@adonisjs/ace')

const Role = use('Role')
const Permission = use('Permission')
// const PermissionRole = use('App/Models/PermissionRole')
const Database = use('Database')
const permissionRole = use('/../../resources/permission/permission_role.js')

class CreatePermissionRole extends Command {
  static get signature() {
    return 'create:permission:role'
  }

  static get description() {
    return 'Update permission_role from json file project/resources/permission_role.js'
  }

  async handle(args, options) {
    this.info('Start...')

    try {
      const roles = await Role.query().fetch()
      const RolesDataObject = roles.rows.reduce((result, item) => {
        result[item.slug] = item.id
        return result
      }, {})

      const permissions = await Permission.query().fetch()
      const PermissionsDataObject = permissions.rows.reduce((result, item) => {
        result[item.slug] = item.id
        return result
      }, {})

      const rolePermissions = []
      permissionRole.forEach((item) => {
        const rolePermissionObj = {}

        const permissionsSlugs = []
        item.permissions.actions.forEach((action) => {
          const permission = `${action}_${item.permissions.slug}`
          permissionsSlugs.push(permission)
        })
        const permissionsIds = permissionsSlugs.map((slug) => {
          return PermissionsDataObject[slug]
        })
        rolePermissionObj.roleName = item.role.name
        rolePermissionObj.roleId = RolesDataObject[item.role.slug]
        rolePermissionObj.permissions = permissionsIds

        rolePermissions.push(rolePermissionObj)
      })

      for (let i = 0; i < rolePermissions.length; i++) {
        this.info(`${rolePermissions[i].roleName} permissions creating`)
        const role = await Role.find(rolePermissions[i].roleId)
        await role.permissions().attach(rolePermissions[i].permissions)
        this.success(`${rolePermissions[i].roleName} permissions created`)
      }

      this.success(`${this.icon('success')} Permission_role table was created successfully`)
    } catch (e) {
      this.error(e)
    }

    await Database.close()
  }
}

module.exports = CreatePermissionRole
