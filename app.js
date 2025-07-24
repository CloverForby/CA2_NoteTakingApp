const express = require('express');
const mysql = require('mysql2');

const session = require('express-session');
const flash = require('connect-flash');
const app = express();
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



//middleware function on app.js
const validateRegistration = (req, res, next) => {
    const {username, email, password} = req.body

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required.');
    }

    if (password.length < 6) {
        req.flash('error', 'Password should be at least 6 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/register')
    }
    next();
};

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
        res.render('index',{notes:results});
    });

});

app.get('/deleteNote/:id',(req,res)=> {
    const noteId = req.params.id
    const sql = "DELETE FROM notes WHERE noteId = ?";
    connection.query(sql, [noteId], (error, results) => {
        if (error) {
            console.error("Error deleting Note:", error);
        } else {
            res.redirect ('/')
        }
    })
})
//Login page route on app.js
app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});

//Register route on app.js
app.post ('/register', validateRegistration, (req, res) => {
    const { username, email, password} = req.body;
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, SHA1(?))';
    connection.query(sql, [username, email, password], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
});

//Login page route on app.js
app.get('/login', (req, res) => {
    res.render('login', {
        messages: req.flash('success'),
        errors: req.flash('error')
    });
});

//login route for form submission on app.js
app.post('/login', (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)'
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            throw err;
        }

        if (results.length > 0) {
            req.session.user = results[0];
            req.flash('success', 'Login successful!');
            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    });
});

//logout route on app.js
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


//Set up view engine
app.set('view engine','ejs');
//enable static files
app.use(express.static('public'));



const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port${PORT}`));