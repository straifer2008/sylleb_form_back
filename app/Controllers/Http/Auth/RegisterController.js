'use strict'

const {
  validate
} = use('Validator')
const User = use('App/Models/User')
const Mail = use('Mail')
const randomstring = require("randomstring")

class RegisterController {
    async register({
        request,
        response
      }) {
        const userName = request.input('username', '')
        const userEmail = request.input('email', '')
        const userPassword = request.input('password', '')

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
          return response.status(400).send({
            type: 'danger',
            message: validation.messages()
          });
        }

        //
        //Create user
        //
        const user = await User.create({ 
            username : userName,
            email: userEmail,
            password: userPassword,
            confirmation_token: randomstring.generate({
              length: 40
            }),
            register_user_token: randomstring.generate({
              length: 40
            }),
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
        return response.status(200).send({
          token: user.confirmation_token,
          message: "Congratulation, register is success. We sen to your email address confirmation link, please confirm him."
        })
    }

    async confirmEmail({
        request,
        response
    }) {

        //
        // Get user with  confirmation token
        //
        const userToken = request.post();
        const user = await User.findBy('confirmation_token', userToken.token)
        
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
        return response.status(200).send({
          userToken: user.register_user_token,
          message: 'Thanks, your mail has been successfully verified'
        })
    }
}

module.exports = RegisterController
