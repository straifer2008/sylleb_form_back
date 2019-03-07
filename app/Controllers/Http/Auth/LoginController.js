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
    return response.status(500).send({
      type: 'danger',
      message: `We couldn't verify user credentials. Make sure you've confirmed your email address`
    })
  }

  async getUserData ({
    request,
    auth,
    response
  }) {
    //
    // Get user token
    //
    const token = request.input('token')
    if (!token) {
      return response.status(500).send({
        type: 'danger',
        message: 'No user token'
      })
    }
    
    //
    // Get user data by token
    //
    const user = await User.query()
      .where('register_user_token', token)
      .where('is_active', true)
      .first()
    const allUsers = await User.all()
    if (user) {
      return response.status(200).send({
        type: 'success',
        user: {
          id: user.id,
          name: user.username,
          created: user.created_at,
          allUsers: allUsers
        }
      })
    } else {
      return response.status(500).send({
        type: 'danger',
        message: 'No find user'
      })
    }
  }
}

module.exports = LoginController