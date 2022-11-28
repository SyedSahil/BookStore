const express = require('express');

const Router = express.Router();

const shopController = require('../controller/shop');



Router.get('/',shopController.getStore);
// Router.get('/books',shopController.getStore);


Router.get('/book-detail/:id',shopController.getBookDetail);

Router.get('/book-download/:id',shopController.postDownload);


module.exports = Router;