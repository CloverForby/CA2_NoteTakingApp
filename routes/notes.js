const express = require('express');
const router = express.Router();
const utils = require('../util');

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
            res.redirect('login');
        } else {
            var sql = "";
            var isAdmin = req.session.user.userRole == "admin";
            if (isAdmin){
                sql = 'SELECT * FROM notes';
            } else {
                sql = 'SELECT * FROM notes WHERE userId = ?';
            }
            const userId = req.session.user.userId;
            //Fetch Data f\From MySQL
            connection.query(sql, userId  ,(error,results)=>{
                if(error){
                    console.error('Database query error:', error.message);
                    return res.status(500).send('Error Retrieving');
                }
                const catsql = 'SELECT * FROM categories';
                connection.query(catsql, (error,catresults)=>{
                    res.render('index',{notes:results, categories: catresults, isAdmin : isAdmin, isLoggedIn: utils.isUserLoggedIn(req)});
                })
                //Render HTML page with data
            });
        }
        
    });

    //SEARCH FUNCTION (MELISSA)
    router.post('/', (req,res)=>{
        const { categoryId, title } = req.body;
        console.log(req.body);
        const isAdmin = utils.isAdmin(req);
        var sql = "SELECT * FROM notes "
        var categoryVal = categoryId != 0
        var titleVal = title != undefined && title.trim() !== '';
        var isEmpty = !categoryVal && !titleVal
        const userId = req.session.user.userId;

        var params = [];
        if (!isEmpty){
            sql += "WHERE "
        }
        if (titleVal){
            sql += "title LIKE ? "
            params.push(title)
        }
        if (categoryVal){
            if (titleVal){
               sql += "AND "
            }
            sql += "categoryId = ? "
            params.push(categoryId)
        }
        if (!isAdmin){
            if (isEmpty){
                
                sql += "WHERE userId = ?";
            } else {
                sql += "AND userId = ?";
            }
            params.push(userId)
        }
        console.log(sql);
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error adding note:', error);
                return res.status(500).send('Error adding note');
            } else {
                const catsql = 'SELECT * FROM categories';
                connection.query(catsql, (error,catresults)=>{
                    res.render('index',{notes:results, categories: catresults, isAdmin : isAdmin, isLoggedIn: utils.isUserLoggedIn(req)});
                })
            }
        });
    });
    
    //addnote (shayne)
    router.get('/addNote', (req, res) => {
        if (utils.isUserLoggedIn(req)){
            const isAdmin = utils.isAdmin(req)
            //GETTING CATEGORIES
            const sql = 'SELECT * FROM categories';
            //Fetch Data f\From MySQL
            connection.query(sql,(error,results)=>{
                if(error){
                    console.error('Database query error:', error.message);
                    return res.status(500).send('Error Retrieving');
                }
                //Render HTML page with data
                res.render('addNote', {categories:results, isAdmin:isAdmin, isLoggedIn: utils.isUserLoggedIn(req) });
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
        const isAdmin = utils.isAdmin(req);
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
                            res.render('editNote', { note: results[0], isAdmin: isAdmin, categories: catresults,isLoggedIn: utils.isUserLoggedIn(req) }); // sends note data to EJS
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