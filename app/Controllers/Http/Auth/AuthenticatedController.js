'use strict'

class AuthenticatedController {

    async logout({
        response,
        auth,
    }) {
        await auth
                .authenticator('jwt')
                .revokeTokens(auth.current.user, [auth.getAuthHeader()])
        return response.status(200).json({
            type: 'success',
            message: 'Logout success'
        })
    }

}

module.exports = AuthenticatedController
