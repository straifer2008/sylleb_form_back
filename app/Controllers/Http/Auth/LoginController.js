'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class LoginController {
  async login({
    request,
    auth,
    response
  }) {

    //
    // Get form data
    //
    const {
      email,
      password,
      remember
    } = request.post()

    //
    // Retrieve user base on the form data
    //
    const user = await User.query()
      .where('email', email)
      .where('is_active', true)
      .first()

    //
    // Verify password
    //
    if (user) {
      const passwordVerified = await Hash.verify(password, user.password)

      if (passwordVerified) {

        //
        // Login user
        //
        await auth.remember(!!remember).login(user)

        return response.status(200).send({
          userToken: user.register_user_token,
          message: 'User verify is success'
        })
      }
    }

    //
    // Display error message
    //
    return response.status(400).send({
      type: 'danger',
      message: `We couldn't verify user credentials. Make sure you've confirmed your email address`
    })
  }
}

module.exports = LoginController