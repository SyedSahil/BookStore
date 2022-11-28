const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const csrf = require('csurf');


const app = express();



const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null,'images');
    },
    filename:(req,file,cb) => {
       
        cb(null,req.body.bookName.toLowerCase().split(' ').join('') + '-by-' + req.body.authorName.toLowerCase().split(' ').join('') + '.' + file.mimetype.split('/')[1]);
    }
});



const {diskStorage} = require('multer');


const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

app.set('view engine','ejs');
app.set('views','views');

app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(multer({storage:fileStorage}).fields([{name:'image'},{name:'book'}]));
app.use('/books',express.static(path.join(__dirname, 'pdfs')));

const store = new mongoDBStore({
    uri:'mongodb+srv://Sahil:Sahilkazmi786@cluster0.rg9fd.mongodb.net/bookStore',
    collection:'sessions'
})

app.use(session({
    secret:'thisismysecret',
    saveUninitialized:false,
    resave:false,
    store:store
}));

app.use(csrfProtection)

app.use((req,res,next) => {
    User.findById('63819ceba82728330d26eda1').then(user => {
        req.user = user;
        console.log(user);
        next(); 
    })
    
});

app.use((req,res,next) => {
    res.locals.csrfToken = req.csrfToken()
    next()

})

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use('/auth',authRoutes);

mongoose.connect('mongodb+srv://Sahil:Sahilkazmi786@cluster0.rg9fd.mongodb.net/bookStore')
.then(() => {
    app.listen(3000);
    

})
.catch(err => {
    console.log(err);
})


