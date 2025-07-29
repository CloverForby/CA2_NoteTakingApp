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
    host:'localhost', //Guys PLs change this to your MySQL host
    user:'root', //Guys PLs change this to your MySQL username
    password: 'pass', //Guys PLs change this to your MySQL password
    database:'note_tabledb'
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



//Define routes
app.get('/',(req,res)=>{
    const sql = 'SELECT * FROM notes';
    //Fetch Data f\From MySQL
    connection.query(sql,(error,results)=>{
        if(error){
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving');
        }
        //Render HTML page with data
        console.log(results)
        res.render('index',{notes:results, isLoggedIn: utils.isUserLoggedIn(req)});
    });
});

//addnote (shayne)
app.get('/addNote', (req, res) => {
    res.render('addNote', { isLoggedIn: utils.isUserLoggedIn(req) });
});

app.post('/addNote', (req, res) => {
    const { title, content } = req.body;
    const sql = 'INSERT INTO notes (user, title, date) VALUES (?, ?, ?)';

    connection.query(sql, [req.session.userId, title, new Date()], (error, results) => {
        if (error) {
            console.error('Error adding note:', error);
            return res.status(500).send('Error adding note');
        } else {
            res.redirect('/');
        }
    });
});

//Set up view engine
app.set('view engine','ejs');
//enable static files
app.use(express.static('public'));



const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port${PORT}`));