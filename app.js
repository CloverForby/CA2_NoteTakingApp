const express = require('express');
const mysql = require('mysql2');

const session = require('express-session');
const flash = require('connect-flash');
const userRoutes = require('./routes/user');
const searchRoutes = require('./routes/searchncat');
const notesRoutes = require('./routes/notes');
const app = express();
const utils = require('./util');
const notes = require('./routes/notes');


const connection = mysql.createConnection({
    host:'qlciga.h.filess.io', //Guys PLs change this to your MySQL host
    user:'NoteTakingApp_tripnestit', //Guys PLs change this to your MySQL username
    password: '543f263e9b0dc79475ac6fa57294581a8f74e568', //Guys PLs change this to your MySQL password
    database:'NoteTakingApp_tripnestit'
})
connection.connect((err) =>{
    if(err){
        console.error('Error connecting to MySQL:',err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session ({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 1}
}));

app.use(flash());
//Create MySql connection
app.set('view engine', 'ejs');


//USER ROUTES
app.use('/',userRoutes(connection));
//NOTES ROUTES
app.use('/',notesRoutes(connection));
//SEARCH ROUTES
app.use('/',searchRoutes(connection));





//Set up view engine
app.set('view engine','ejs');
//enable static files
app.use(express.static('public'));



const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port${PORT}`));
