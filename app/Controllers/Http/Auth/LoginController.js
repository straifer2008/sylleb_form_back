'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class LoginController {
  showLoginForm({
    view
  }) {
    return view.render('auth.login')
  }

  async login({
    request,
    auth,
    session,
    response
  }) {
    //
    // Get form data
    // 

    const {
      email,
      password,
      remember
    } = request.all()

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

        return response.route('home')
      }
    }

    //
    // Display error message
    //
    session.flash({ 
        notification: {
            type: 'danger',
            message: `We couldn't verify user credentials. Make sure you've confirmed your email address`
        }
    })

    return response.redirect('back')
  }
}

module.exports = LoginController