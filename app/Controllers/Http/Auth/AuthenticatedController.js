'use strict'

class AuthenticatedController {
    async logout({ auth, response }) {
        await auth.logout()

        return response.status(200).send({
            type: 'success',
            message: 'Log Uot is complete'
        })
    }
}

module.exports = AuthenticatedController
