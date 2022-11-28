const Book = require('../models/book')
const fs = require('fs');
const pdfDocument = require('pdfkit');
const path = require('path');

let items_per_page = 3;

exports.getStore = (req,res,next) => {

    const page = +req.query.page || 1;
    let totalItems;

    Book.count().then(productNum => {
        totalItems = productNum;

        return Book.find().skip((page - 1) * items_per_page).limit(items_per_page);
    })
    .then(books => {
        res.render('shop/books',
        {
            books:books,
            editMode:false,
            isLoggedIn:req.session.isLoggedIn,
            items_per_page:items_per_page,
            currentPage : page,
            hasNextPage : (items_per_page * page) < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems/ items_per_page)
        
        })
    })
}

exports.getBookDetail = (req,res,next) => {
    const id = req.params.id
    
    
    Book.findById(id).then(book => {
        console.log(book);
       res.render('shop/book-detail',{
        book:book,
        isLoggedIn:req.session.isLoggedIn
       })
    })

};


exports.postDownload = (req,res,next) => {

    const id = req.params.id;

    Book.findById(id).then(book => {

        const pdfName = book.bookName.split(' ').join('').toLowerCase() + '-by-' + book.authorName.split(' ').join('').toLowerCase() + '.pdf';
        const pdfPath = path.join(__dirname,'../','images', pdfName);
        console.log(pdfName);
        console.log(pdfPath);
        
        const rs = fs.createReadStream(pdfPath);
        res.setHeader("Content-Disposition",'attachment; filename="' + pdfName + '"');

        rs.pipe(res);
    })
    
}

