'use strict'

const {
  validate
} = use('Validator')
const User = use('App/Models/User')
const Mail = use('Mail')
const randomstring = require("randomstring")

class RegisterController {
    showRegisterForm({view}) {
        return view.render('auth.register')
    }

    async register({
        request,
        session,
        response
      }) {
        //
        //Validate form
        //
        const rules = {
            username: 'required|unique:users,username',
            email: 'required|email|unique:users,email',
            password: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
          session
            .withErrors(validation.messages())
            .flashExcept(['password'])

          return response.redirect('back')
        }

        //
        //Create user
        //
        const user = await User.create({ 
            username : request.input('username', ''),
            email : request.input('email', ''),
            password : request.input('password', ''),
            confirmation_token: randomstring.generate({
              length: 40
            })
        })

        //
        //Send confirmation email
        //
        await Mail.send('auth.emails.confirm_email', user.toJSON(), (message) => {
          message
            .to(user.email)
            .from('sylleb@confirm.com')
            .subject('Please confirm your email address')
        })

        //
        //Display success message
        //

        session.flash({
            notification: {
                type:    'success',
                message: 'Registration successful! A email has been sent to your email address, please confirm him.'
            }
        })

        return response.redirect('login')
    }

    async confirmEmail({
        params,
        session,
        response
    }) {
        //
        // Get user with  confirmation token
        //
        const user = await User.findBy('confirmation_token', params.token)
        
        //
        // Set confirmation to null and is_active to true
        //
        user.confirmation_token = null
        user.is_active = true

        //
        // Persist user to database
        //
        await user.save()

        //
        // Display success message
        //
        session.flash({ 
            notification : {
                type: 'success',
                message: 'Your email address has been confirm'
            }
        })

        return response.redirect('/login')
    }
}

module.exports = RegisterController
