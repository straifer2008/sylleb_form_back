'use strict'

const {
  Command
} = require('@adonisjs/ace')

const Permission = use('Permission')
const Database = use('Database')
const permissions = use('/../../resources/permission/permissions.js')

class CreatePermissions extends Command {
  static get signature() {
    return 'create:permissions'
  }

  static get description() {
    return 'Update permissions from json file project/resources/permissions.js'
  }

  async handle() {
    this.info('Start...')

    try {
      for (const key of Object.keys(permissions)) {
        const value = permissions[key]
        this.info(`${key} creating`)

        for (const action of value.actions) {
          await Permission.findOrCreate({
            slug: `${action}_${value.slug}`
          }, {
            slug: `${action}_${value.slug}`,
            name: `${value.name} ${action}`,
            description: `${value.name} ${action}`
          })

          this.success(`${key} ${action} created`)
        }
      }

      this.success(`${this.icon('success')} Creating permissions success`)
    } catch (e) {
      this.error(e)
    }

    await Database.close()
  }
}

module.exports = CreatePermissions
