const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');

// Route 1 : Get all notes of user using GET "/api/notes/fetchallnotes" No login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error Occurred')
    }
});

// Route 2 : Add notes using POST "/api/notes/addnotes" No login Required
router.post("/addnotes", fetchuser,
  [
    body("title", "Enter a valid Title").isLength({ min: 3 }),
    body("description", "Description must be at least 5 Characters").isLength({min: 5}),
  ],
  async (req, res) => {
    const {title, description, tag} = req.body;
    // If there are errors, return Bad Request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
        const notes = new Notes({
            title, description, tag, user: req.user.id
        })
        const savednotes = await notes.save();
        res.json(savednotes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error Occurred')
    }
  }
);

// Route 3 : Update an existing note using PUT "/api/notes/updatenotes" No login Required
router.put("/updatenotes/:id", fetchuser, async(req, res) => {
    const {title, description, tag} = req.body;

    try {
    // Create a newNote Object
    const newNote = {};
    if(title) {newNote.title = title};
    if(description) {newNote.description = description};
    if(tag) {newNote.tag = tag};

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send("Not Found")
    };
    // Allow Updation only if user owns the note
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    };

    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
    res.json({note});
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error Occurred')
    }
})

// Route 4 : Delet an existing note using DELETE "/api/notes/deletenotes" No login Required
router.delete("/deletenotes/:id", fetchuser, async(req, res) => {
    try {
    // Find the note to be deleted and delete it
    let note = await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send("Not Found")
    };
    // Allow Deletion only if user owns the note
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    };

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({"Success": "Below Note has been Deleted", note:note});
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error Occurred')
    }
})

module.exports = router;
