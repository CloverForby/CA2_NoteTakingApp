const express = require('express');
const router = express.Router();
const utils = require('../util');


//CODE BY IRFAN + minor fixes by melissa

module.exports = (connection) =>{
    //MIDDLEWARE REGISTRATION
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

    //Register page load
    router.get('/register', (req, res) => {
        if (utils.isLoggedIn){
            res.redirect('/')
        } else {
        res.render('register', { 
                messages: req.flash('error'), 
                formData: req.flash('formData')[0],
                isLoggedIn: utils.isUserLoggedIn(req)
            });
        }
    });

    //Register post
    router.post ('/register', validateRegistration, (req, res) => {
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

    //Login page load
    router.get('/login', (req, res) => {
        if (utils.isLoggedIn){
            res.redirect('/')
        } else {
        res.render('login', {
            messages: req.flash('success'),
            errors: req.flash('error'),
            isLoggedIn: utils.isUserLoggedIn(req)
        });}
    });

    //login post
    router.post('/login', (req, res) => {
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
                res.redirect('/');
            } else {
                req.flash('error', 'Invalid email or password.');
                res.redirect('/login');
            }
        });
    });

    //logout route on app.js
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });


    return router;
}


