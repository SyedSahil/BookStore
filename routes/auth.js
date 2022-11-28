const User = require('../models/user');

const {body} = require('express-validator');

const express = require('express');


const Router = express.Router();

const authController = require('../controller/auth');


Router.get('/getSignup',authController.getSignup);

Router.post('/postSignup',
body('name').notEmpty().withMessage('Invalid Name'),
body('email').isEmail().withMessage("Invalid email").notEmpty().withMessage("Invalid email").trim().custom((value,{req}) => {
    console.log(value);
    return User.findOne({email:value}).then(user => {
        console.log(user);
            if(user){
                return Promise.reject('E-mail already in use')
            }
    })

}).withMessage("Email already in use"),
body('password').isLength({min:8}).withMessage("Password length must be more than 8 characters").isAlphanumeric().withMessage("Password length must be more than 8 characters"),
authController.postSignup);

Router.get('/getLogin',authController.getLogin);

Router.post('/postLogin',
body('email').isEmail().withMessage("Invalid Email or Password!")
,authController.postLogin);

Router.get('/postLogout',authController.postLogout);

Router.get('/resetPassword',authController.getResetPassword);

Router.post('/postResetPassword',body('email').isEmail().custom((value,{req}) => {

    return User.findOne({email:value}).then(user => {
        if(!user){
            return Promise.reject('Email not registered!')
        }
    })

}).withMessage("Email not registered!"),authController.postResetPassword);

Router.get('/newPassword/:id',authController.getNewPassword);

Router.post('/postNewPassword',body('password').isLength({min:6}).withMessage("Password length must be more than 8 characters").custom((value,{req}) => {
    console.log(value ,req.body.confirmPassword);
    if(value != req.body.confirmPassword){
        return Promise.reject("Passwords have to match!")
    }
    return true;

}).withMessage("Passwords have to match!"),authController.postNewPassword);

Router.post('/postVerifyEmail',authController.postVerifyEmail);


module.exports = Router;