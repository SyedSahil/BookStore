const express = require('express');

const Router = express.Router();

const adminController = require('../controller/admin');

const isAuth = require('../middlewares/isAuth');

const {body} = require('express-validator');


Router.get('/add-book', isAuth.isAuth,adminController.getAddBook);

Router.post('/add-book',
body('authorName').isLength({min:4}).withMessage("Author's name length should be more than 8 characters"),
body('bookName').isLength({min:5}).withMessage("Book's name length should be more than 5 characters"),
body('description').isLength({min:10}).withMessage("Book description should be more than 10 characters")
,adminController.postAddBook);

Router.get('/books',isAuth.isAuth, adminController.getAdminBooks);

Router.get('/edit-book/:id',isAuth.isAuth, adminController.getEditBook);

Router.get('/delete-book/:id',isAuth.isAuth, adminController.postDeleteBook);


module.exports = Router;