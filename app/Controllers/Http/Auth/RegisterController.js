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
            message: validation.messages()[0].message
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
            })
        })

        user.roles().attach([2])

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
          type: 'success',
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
        const userToken = request.post('token')
        if (!userToken) {
          return response.status(403).send({
            type: 'danger',
            message: 'No confirmation token'
          })
        }

        const user = await User.findBy('confirmation_token', userToken.token)

        if (user) {
          try {
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
             type: 'success',
             message: 'Thanks, your mail has been successfully verified',
           })
          } catch (error) {
            return response.status(500).send({
              type: 'danger',
              message: 'Some confirmation error'
            })
          }
        } else {
          return response.status(403).send({
            type: 'danger',
            message: 'Confirmation token not valid'
          })
        }
    }
}

module.exports = RegisterController
