const User = require('../models/user');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const Courier = require('@trycourier/courier');
const cryptojs = require('crypto-js');


const courier = Courier.CourierClient({authorizationToken:"pk_test_D37B46Y82XMEJNM0A5ADSBZ2DF2B"});

exports.getSignup = (req,res,next) => {

res.render('auth/getSignup',{
    isLoggedIn:req.session.isLoggedIn,
    hasErrors:false
})
}

exports.postSignup = (req,res,next) => {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    console.log(errors.array()[0]);

    if(errors.array().length > 0){
        
        return res.render('auth/getSignup',{
            isLoggedIn:req.session.isLoggedIn,
            hasErrors:errors.array()[0],
            oldInputs:{
                name:name,
                email:email,
                password:password
            }
        })
    }

    

    const num = Math.floor(Math.random() * (9999999 - 100000 + 1) ) + 100000;

    const {requestId} = courier.send({
        message: {
          to: {
            data: {
              name: "Marty",
              link:``
            },
            email: email,
          },
          content: {
            title: "Email Verification",
            body:`Your ONE TIME PASSWORD(OTP) for Verification is: ${num}`
          },
          routing: {
            method: "single",
            channels: ["email"],
          },
        },
      });

    res.render('auth/emailVerify',{
        email:email,
        password:password,
        name:name,
        hasErrors:false,
        isLoggedIn:req.session.isLoggedIn,
        num:num,
    })
};

exports.postVerifyEmail = (req,res ,next) => {
    const otp = req.body.otp;
    const num = req.body.num;
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;


    if(otp == num){

        bcrypt.hash(password,12).then(hashPassword => {

            const user = new User({
                name:name,
                email:email,
                password:hashPassword
            })
            user.save()
            return res.redirect('/auth/getLogin');
    
        })
    }
    else{
        return res.render('auth/getSignup',{
            isLoggedIn:req.session.isLoggedIn,
            hasErrors:{
                msg:"Verification failed.Try again!"
            },
            oldInputs:{
                name:'',
                email:'',
                password:''
            }
        })
    }
}

exports.getLogin = (req,res,next) => {

    res.render('auth/getLogin.ejs',{
        isLoggedIn:req.session.isLoggedIn,
        hasErrors:false,
        message:'',
        oldInputs:{
            email:''
        }

    })
};

exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(errors.array().length > 0){
        
        return res.render('auth/getLogin',{
            isLoggedIn:req.session.isLoggedIn,
            hasErrors:true,
            message:"Invalid Email or Password!",
            oldInputs:{
                email:email
            }
        })
    }

    User.findOne({email:email}).then(user => {
        if(!user){
            return res.render('auth/getLogin',{
                isLoggedIn:req.session.isLoggedIn,
                hasErrors:true,
                message:"Invalid Email or Password!",
                oldInputs:{
                    email:email
                }
            })
        }

        bcrypt.compare(password,user.password).then(doMatch => {
            if(!doMatch){

                return res.render('auth/getLogin',{
                    isLoggedIn:req.session.isLoggedIn,
                    hasErrors:true,
                    message:"Invalid Email or Password!",
                    oldInputs:{
                        email:email
                    }
                })
            }
            console.log('successfull login');
            req.session.user = user;
            req.session.isLoggedIn = true;
            return res.redirect('/');

        })
    })
}

exports.postLogout = (req,res,next) => {

    req.session.destroy();
    console.log('destroyed');
    res.redirect('/');    

};

exports.getResetPassword = (req,res,next) => {
    
    res.render('auth/resetPassword',{
        isLoggedIn:req.session.isLoggedIn,
        hasErrors:false,

    })
};

exports.postResetPassword = (req,res,next) => {

    const email = req.body.email;
    const errors = validationResult(req);


    if(errors.array().length > 0){
        
        return res.render('auth/resetPassword',{
            isLoggedIn:req.session.isLoggedIn,
            hasErrors:errors.array()[0],
            oldInputs:{
                email:''
            }
        })
    }

    User.findOne({email:email}).then(user => {

        const userId = user._id;


        const {requestId} = courier.send({
            message: {
              to: {
                data: {
                  name: "Marty",
                  link:`http://localhost:3000/auth/newPassword/${userId}`
                },
                email: email,
              },
              content: {
                title: "Your Password reset link",
                body:"Click on the given link to reset your password : {{link}}"
              },
              routing: {
                method: "single",
                channels: ["email"],
              },
            },
          });

          return res.render('auth/getLogin',{
            isLoggedIn:req.session.isLoggedIn,
            hasErrors:false,
            message:"",
            oldInputs:{
                email:''
            }
        })
    })
}

exports.getNewPassword = (req,res,next) => {

    const userId = req.params.id;

    res.render('auth/getNewPassword',{
        isLoggedIn:req.session.isLoggedIn,
        hasErrors:false,
        userId:userId
    })
};

exports.postNewPassword = (req,res,next) => {

    const userId = req.body.userId;

    const errors = validationResult(req);

    if(errors.array().length > 0){
        
        return res.render('auth/getNewPassword',{
            isLoggedIn:req.session.isLoggedIn,
            hasErrors:errors.array()[0],
            userId:userId
        })
    }


    const password = req.body.password;

    bcrypt.hash(password,12).then(hashPassword => {

        User.findOne({_id:userId}).then(user => {
            if(!user){
                return console.log('User not found!')
            }
            user.password = hashPassword;
            return user.save()
        })
        .then(user => {
            console.log("password changed successfully!");
            
            return res.render('auth/getLogin',{
                isLoggedIn:req.session.isLoggedIn,
                hasErrors:false,
                message:"",
                oldInputs:{
                    email:''
                }
            })
            
        })

    })
};