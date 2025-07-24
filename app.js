const express = require('express');
const mysql = require('mysql2');
const app = express();

//Create MySql connection
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



//Set up view engine
app.set('view engine','ejs');
//enable static files
app.use(express.static('public'));



const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port${PORT}`));