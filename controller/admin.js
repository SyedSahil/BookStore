const Book = require('../models/book');
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator')



exports.getAddBook = (req,res,next) => {

    res.render('admin/add-book',{
        editMode:false,
        isLoggedIn:req.session.isLoggedIn,
        hasErrors:false,
        book:{
            bookName:'',
            authorName:'',
            description:''
        },
        errors:[]
    })
}

exports.postAddBook = (req,res,next) => {

    const bookName = req.body.bookName.trim();
    const authorName = req.body.authorName.trim();
    const size = req.body.size;
    const description = req.body.description.trim();
    const id = req.body.id;
    let imagePath;
    let pdfPath;
    console.log(req.files);
    console.log(Object.keys(req.files).length > 0);
    

    if(Object.keys(req.files).length > 0){    

        if(req.files.image.length > 0){

            imagePath = '/' + req.files.image[0].destination + '/' + req.files.image[0].filename;
            pdfPath = '/' + req.files.book[0].destination + '/' + req.files.book[0].filename;
         }
    }

    
   

    const errors = validationResult(req);
    console.log(errors.array())

    if(errors.array().length > 0){

        return res.render('admin/add-book',{
            editMode:false,
            isLoggedIn:req.session.isLoggedIn,
            hasErrors:true,
            errors:errors.array()[0],
            book:{
                bookName:bookName,
                authorName:authorName,
                description:description
            }
        })
    }


    if(!id){
        const book = new Book({
            bookName:bookName,
            authorName:authorName,
            size:size,
            imageUrl:imagePath,
            pdfUrl:pdfPath,
            description:description,
            user:req.session.user._id
        })
    
        book.save()
    }
    else{
        
        Book.findOneAndUpdate({_id:id},
            {$set:{bookName:bookName,authorName:authorName,size:size,imageUrl:imagePath,description:description}},{new: true}
            ,function(err, doc){
            if(err){
                console.log("Something wrong when updating data!");
            }
        
            console.log(doc);
        });
    }

    return res.redirect('/');

}

exports.getAdminBooks = (req,res,next) => {
    
    let items_per_page = 3
    let totalItems;
    const page = +req.query.page || 1;

    Book.count({user:req.session.user._id}).then(num => {
        totalItems = num;
        return Book.find({user:req.session.user._id}).skip((page - 1) * items_per_page).limit(items_per_page);
    })
    .then(books => {

        res.render('shop/books',{
            books:books,
            editMode:true,
            isLoggedIn:req.session.isLoggedIn,
            currentAdminPage:page,
            hasNextAdminPage: (items_per_page * page) < totalItems,
            hasPreviousAdminPage: page > 1,
            nextAdminPage:page + 1,
            previousAdminPage: page - 1,
            lastAdminPage:Math.ceil(totalItems/items_per_page)

        })



    })

    Book.find()
    .then(books => {
            
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getEditBook = (req,res,next) => {

    const id = req.params.id;

    Book.findById(id).then(book => {
        console.log(book);
        res.render('admin/add-book', {
            book:book,
            editMode:true,
            isLoggedIn:req.session.isLoggedIn,
            hasErrors:false,
            errors:[]
        })
    })
    .catch(err => {
        console.log(err);
    })

}

exports.postDeleteBook = (req,res,next) => {

    const id = req.params.id;

    Book.findById(id).then(book => {
        fs.unlink(path.join(__dirname,'../',book.imageUrl),(err) => {
            if(err){
                console.log(err);
            }
        })
        fs.unlink(path.join(__dirname,'../',book.pdfUrl),(err) => {
            if(err){
                console.log(err);
            }
        })
        })
        .then(result => {
            Book.findOneAndRemove({_id:id}).then(book => {
                console.log(book);
                return res.redirect('/');
            })
        })

}