const mongoose = require('mongoose');

const Book = require('../models/book');


const Schema = mongoose.Schema;


const userSchema = new Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    books:[
        {
                type:Schema.Types.ObjectId,
                ref:'Book'
        }
    ]
});

module.exports = mongoose.model('User',userSchema);