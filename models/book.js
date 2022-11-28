const mongoose = require('mongoose');

const User = require('../models/user');

const Schema = mongoose.Schema;


const bookSchema = new Schema({

    bookName:{
        type:String,
        required:true
    },

    authorName:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    pdfUrl:{
        type:String,
        required:true
    },
    size:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    }

});


module.exports = mongoose.model('Book',bookSchema);