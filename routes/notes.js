const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Users = require('../models/Users');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
// const Notes = require('../models/Notes');


//ROUTE 1 : Get all the notes  using: GET "/api/auth/fetchallnotes" :login required

router.get('/fetchallnotes', fetchuser,
    async (req, res) => {
        try {
          
            const notes = await Note.find({ user: req.user.id })

            res.json(notes)

        } catch (error) {
            console.error(error.message)
            res.status(500).send("Internal server error")
        }
    })


//ROUTE 2: Add a new  notes  using: POST "/api/auth/addnote" :login required

router.post('/addnote', fetchuser, async (req, res) => {

    try {
        const { title, description, tag } = req.body;

        const note = new Note({
            title,
            description,
            tag,
            user: req.user.id
        });

        const savedNote = await note.save();
        res.json(savedNote);   // ✅ send back the saved note
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
});

//ROUTE 3 : Update an existing note  using: PUT "/api/auth/updatenote" :login required


router.put('/updatenote/:id', fetchuser,
    async (req, res) => {
        try {
            const { title, description, tag } = req.body
            // create a newnote object 
            const newnote = {}
            if (title) { newnote.title = title }
            if (description) { newnote.description = description }
            if (tag) { newnote.tag = tag }

            //find the note to be updated and update it
            let note = await Note.findById(req.params.id)
            if (!note) {
                return res.status(404).send("not found")
            }

            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("not allowed")
            }
            note = await Note.findByIdAndUpdate(req.params.id, { $set: newnote }, { new: true })
            res.json({ note })
        } catch (error) {
            console.error(error.message)
            res.status(500).send("Internal server error")
        }
    })



//ROUTE 4 : Delete an existing note  using: DELETE "/api/auth/deletenote" :login required


router.delete('/deletenote/:id', fetchuser,
    async (req, res) => {

        try {
            //find the note to be deleted and delete it
            let note = await Note.findById(req.params.id)
            if (!note) {
                return res.status(404).send("not found")
            }

            //allow deletion only if user owns this note
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("not allowed")
            }
            note = await Note.findByIdAndDelete(req.params.id)
            res.json({ "succes ": "notes has been deleted", note: note })
        } catch (error) {
            console.error(error.message)
            res.status(500).send("Internal server error")
        }
    })
module.exports = router