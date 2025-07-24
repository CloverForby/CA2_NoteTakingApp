const express = require('express');
const router = express.Router();


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

//BY YE LIN
//Update Note Route

module.exports = router;