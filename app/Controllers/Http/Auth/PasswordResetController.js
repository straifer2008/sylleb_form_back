'use strict'

const {
  validate,
  validateAll
} = use('Validator')
const User = use('App/Models/User')
const PasswordReset = use('App/Models/PasswordReset')
const randomstring = require("randomstring")
const Mail = use('Mail')
const Hash = use('Hash')

class PasswordResetController {
    async showLinkRequestForm({ view }) {
        return view.render('auth.passwords.email')
    }

    async sendResetLinkEmail({
        request,
        response
      }) {
          //
          // Validate form input
          //
          const validation = await validate(request.only('email'), {
              email: 'required|email'
          })

          if (validation.fails()) {

              return response.status(400).send({
                type: 'danger',
                message: validation.messages()
              })
          }

          try {
              const user = await User.findBy('email', request.input('email'))

              await PasswordReset.query().where('email', user.email).delete()

              const { token } = await PasswordReset.create({ 
                  email : user.email,
                  token: randomstring.generate({ length: 40 })
                })
                
                const mailData = {
                    user: user.toJSON(),
                    token
                }

                await Mail.send('auth.emails.password_reset', mailData, message => {
                  message.to(user.email)
                    .from('sylleb@resetpassword.com')
                    .subject('Password reset link')
                })

                return response.status(200).send({
                  type: 'success',
                  message: 'We sent to your email address reset password link'
                })
          } catch (error) {
            return response.status(500).send({
              type: 'danger',
              message: 'Sorry, there is no user with this email address'
            })
          }
    }

    async reset({
      request,
      response}) {
        const reqToken = request.input('token')
        const reqPassword = request.input('password')

        //
        // Validate form inputs
        //
        const rules = {
          token: 'required',
          password: 'required|confirmed'
        }
        const validation = await validateAll(request.post(), rules)
        if (validation.fails()) {
            return response.status(400).send({
              type: 'danger',
              message: validation.messages() ? validation.messages() : 'Validation error'
            })
        }

        try {

            //
            // Check if password reet token exist for user
            //
            const token = await PasswordReset.findBy('token', reqToken)

            if (!token) {
              return response.status(500).send({
                type: 'danger',
                message: 'This password reset token is not exist'
              })
            }

            //
            // Get user by the provider email
            //
            const user = await User.findBy('email', token.email)
            if (!user) {
              return response.status(400).send({
                type: 'danger',
                message: 'This user is not exist'
              })
            }
            user.password = reqPassword

            await user.save()

            //
            // Delete password reset token
            //
            const userResetPassword = await PasswordReset.findBy('token', reqToken)
            userResetPassword.delete()

            //
            // Display success message
            //
            return response.status(200).send({
              type: 'success',
              message: 'Congratulations! Password has been reset'
            })
        } catch (error) {

            //
            // Display error message
            //
            return response.status(400).send({
              type: 'danger',
              message: 'Sorry, there is no user with this email address'
            })
        }
    }
}

module.exports = PasswordResetController
