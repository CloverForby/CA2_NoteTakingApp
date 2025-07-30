const express = require('express');
const router = express.Router();
const utils = require('../util');
const util = require('../util');

module.exports = (connection) =>{
    //BY LEVIN
    //Delete Note Route
    router.get('/deleteNote/:id',(req,res)=> {
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

    //BY NATHANIAL
    //Create Note Route
    //Define routes
    router.get('/',(req,res)=>{
        //CHECK IF USER IS LOGGED IN
        if (utils.isUserLoggedIn(req) == false){
            res.render('index',{notes:[],isLoggedIn: utils.isUserLoggedIn(req)});
        } else {
            const userId = req.session.user.userId;
            const sql = 'SELECT * FROM notes WHERE userId = ?';
            //Fetch Data f\From MySQL
            connection.query(sql, userId  ,(error,results)=>{
                if(error){
                    console.error('Database query error:', error.message);
                    return res.status(500).send('Error Retrieving');
                }
                //Render HTML page with data
                console.log(results)
                res.render('index',{notes:results, isLoggedIn: utils.isUserLoggedIn(req)});
            });
        }
        
    });
    
    //addnote (shayne)
    router.get('/addNote', (req, res) => {
        if (utils.isUserLoggedIn(req)){
            //GETTING CATEGORIES
            const sql = 'SELECT * FROM categories';
            //Fetch Data f\From MySQL
            connection.query(sql,(error,results)=>{
                if(error){
                    console.error('Database query error:', error.message);
                    return res.status(500).send('Error Retrieving');
                }
                //Render HTML page with data
                res.render('addNote', {categories:results, isLoggedIn: utils.isUserLoggedIn(req) });
            });
        } else {
            res.redirect("/");
        }
    });
    
    router.post('/addNote', (req, res) => {
        const { title, categoryid, description } = req.body;
        const sql = 'INSERT INTO notes (title,userId,date,categoryId, description) VALUES (?, ?, ?, ? ,?)';
        console.log(req.session);
        connection.query(sql, [title, req.session.user.userId, new Date(), parseInt(categoryid), description], (error, results) => {
            if (error) {
                console.error('Error adding note:', error);
                return res.status(500).send('Error adding note');
            } else {
                res.redirect('/');
            }
        });
    });
    //BY YE LIN
    //Update Note Route
    router.get('/editNote/:id', (req, res) => {
        const noteId = req.params.id;
        const sql = 'SELECT * FROM notes WHERE noteId = ?';
        
        connection.query(sql, [noteId], (error, results) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error retrieving note');
            }
            const categorySql = "SELECT * FROM categories";
            connection.query(categorySql, (error,catresults)=>{
                if (error) {
                    console.error('Database query error:', error.message);
                    return res.status(500).send('Error retrieving note');
                }
                //check if note exists
                if (results.length > 0) {
                    //check if user logged in
                    if (utils.isUserLoggedIn(req)){
                        //check if user has auth
                        if (results[0].userId == req.session.user.userId ){
                            res.render('editNote', { note: results[0], categories: catresults,isLoggedIn: utils.isUserLoggedIn(req) }); // sends note data to EJS
                        } else {
                            res.redirect('/');
                        }
                    } else {
                        res.redirect('/');
                    }
                    
                } else {
                    res.status(404).send('Note not found');
                }
            });
            });
        });
            
    router.post('/editNote/:id', (req, res) => {
         const noteId = req.params.id;
         const { title, description, categoryId } = req.body;
         console.log(categoryId);
         const sql = 'UPDATE notes SET title = ?, description = ?, categoryId = ?, date = NOW() WHERE noteId = ?';
        
         connection.query(sql, [title, description, categoryId, noteId], (error, results) => {
            if (error) {
            console.error('Error updating note:', error.message);
            return res.status(500).send('Error updating note');
         }
        
            res.redirect('/'); // after successful update, go back to homepage
         });
    });
    return router
}