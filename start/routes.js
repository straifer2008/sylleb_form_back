'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('home').as('home')

Route.post('register', 'Auth/RegisterController.register')
Route.post('confirm-register', 'Auth/RegisterController.confirmEmail')
Route.post('login', 'Auth/LoginController.login')
Route.get('logout', 'Auth/AuthenticatedController.logout')
Route.post('forgot-password', 'Auth/PasswordResetController.sendResetLinkEmail')
Route.post('password-reset', 'Auth/PasswordResetController.reset')