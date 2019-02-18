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
        session,
        response
      }) {
          //
          // Validate form input
          //
          const validation = await validate(request.only('email'), {
              email: 'required|email'
          })

          if (validation.fails()) {
              session.withErrors(validation.messages()).flashAll()

              return response.redirect('back')
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

                session.flash({ 
                    notification: {
                        type: 'success',
                        message: 'We sent to your email address reset password link'
                    }
                })
                return response.redirect('back')
          } catch (error) {
              session.flash({
                notification: {
                  type: 'danger',
                  message: 'Sorry, there is no user with this email address'
                }
              })
          }
    }

    async shoResetForm(params, view) {
        return view.render('auth.password.reset', { token: params.token })
    }

    async reset({ request, session, response }) {
        //
        // Validate form inputs
        //
        const validation = validateAll(request.all(), {
            token: 'require',
            email: 'require',
            password: 'require|confirmed',
        })

        if (validation.fails()) {
            session.withErrors(validation.message()).flashExcept(['password', 'password_confirmation'])
            
            return response.redirect('back')
        }

        try {
            //
            // Get user by the provider email
            //
            const user = User.findBy('email', request.input('email'))

            //
            // Check if password reet token exist for user
            //
            const token = PasswordReset.query
              .where('email', user.email)
              .where('token', request.input('token'))
              .first()

              if (!token) {
                session.flash({
                  notification: {
                    type: 'danger',
                    message: 'This password reset token is not exist'
                  }
                })
              }

              user.password = await Hash.make(request.input('password'))
              await user.save()

              //
              // Delete password reset token
              //
              await PasswordReset.query().where('email', user.email).delete()

              //
              // Display succes message
              //
              session.flash({
                notification: {
                  type: 'success',
                  message: 'Congratulations! Password has been reset'
                }
              })

              return response.redirect('/login')

        } catch (error) {
            //
            // Display error message
            //
            session.flash({ 
                notification: {
                    type: 'danger',
                    message: 'Sorry, there is no user with this email address'
                }
            })

            return response.redirect('back')
        }
    }
}

module.exports = PasswordResetController
