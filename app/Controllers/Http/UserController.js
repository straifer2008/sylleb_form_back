'use strict'

const User = use('App/Models/User')

class UserController {
  async register({
    request,
    auth,
    response
  }) {
    const {
      username,
      email,
      password
    } = request.all()

    let user = new User()
    user.username = username
    user.email = email
    user.password = password

    user = await user.save()
    let accessToken = await auth.generate(user)
    return response.status(200).send({
      "user": user,
      "access_token": accessToken
    })
  }

  async login({
    request,
    auth,
    response
  }) {
    const {
      email,
      password,
      remember
    } = request.all()

    try {
      if (await auth.attempt(email, password)) {
        let user = await User.findBy('email', email)
        let accessToken = await auth.generate(user)
        return response.json({
          "user": user,
          "access_token": accessToken
        })
      }

    } catch (e) {
      return response.json({
        message: 'You first need to register!'
      })
    }
  }
    
  logout({
      request,
      auth,
      response
    }) {
    
  }
}

module.exports = UserController
