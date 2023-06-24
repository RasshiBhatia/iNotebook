import React, { useContext, useEffect, useRef, useState } from 'react';
import noteContext from '../context/notes/NoteContext';
import NoteItem from './NoteItem';
import AddNote from './AddNote';
import { useNavigate } from 'react-router-dom';

const Notes = (props) => {
  const context = useContext(noteContext);
  const {notes, getNotes, editNote} = context;
  const [note, setnote] = useState({id:"", etitle:"", edescription:"", etag:""})
  let navigate = useNavigate();

  useEffect(()=>{
    if(localStorage.getItem('token')){
      getNotes();
    }
    else{
      navigate('/login')
    }
    
    // eslint-disable-next-line
  },[])
  const ref = useRef(null);
  const refClose = useRef(null);
  
  const onChange = (e) =>{
    setnote({...note, [e.target.name]: e.target.value})
  }

  const updateNote = (currentNote) => {
    ref.current.click();
    setnote({id:currentNote._id, etitle:currentNote.title, edescription:currentNote.description, etag:currentNote.tag});
    
  }

  const handleClick = () => {
    console.log("Updating Notes", note)
    editNote(note.id, note.etitle, note.edescription, note.etag);
    props.showAlert("Updated Successfully", "success")
    refClose.current.click();
    
  }

  return (
    <>
    <AddNote showAlert={props.showAlert} />
    <button type="button" ref={ref} className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
      Launch demo modal
    </button>
    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">Edit Note</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form className='my-3'>
              <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input type="text" className="form-control" id="etitle" name="etitle" aria-describedby="emailHelp" value={note.etitle} minLength={5} required onChange={onChange}/>
              </div>
              <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <input type="text" className="form-control" id="edescription" name='edescription' value={note.edescription} minLength={5} required onChange={onChange}/>
              </div>
              <div className="mb-3">
              <label htmlFor="tag" className="form-label">Tag</label>
              <input type="text" className="form-control" id="etag" name='etag' value={note.etag} minLength={5} required onChange={onChange}/>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" ref={refClose} className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button disabled={note.etitle.length<5 || note.edescription.length<5} type="button" className="btn btn-primary" onClick={handleClick}>Update Notes</button>
          </div>
        </div>
      </div>
    </div>
    <div className="row my-3">
        <h2>Your Notes</h2>
        <div className="container mx-2">
          {notes.length === 0 && "No Notes to Display"}
        </div>
        {notes.map((note)=>{
          return <NoteItem key={note._id} updateNote={updateNote} showAlert={props.showAlert} note={note}/>;
        })}
    </div>
    </>
  )
}

export default Notes
