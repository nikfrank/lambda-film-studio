import React, { useState, useEffect } from 'react';
import './App.css';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { futch } from './futch';

import stub from './stub';


const groupStills = allFiles => {
  const filenames = allFiles.map(file => file.Key).filter(filename=> filename.match(/-out\d+\.png/));

  const slugs = Array.from(new Set(
    filenames.map(filename=> filename.slice(0, filename.lastIndexOf('-out')))
  ));

  return slugs.map(slug => ({ slug, stills: filenames.filter(filename=> filename.match(new RegExp(slug + '-out\\d\\.png'))) }));
};

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  minHeight: 500
});

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  background: isDragging ? "lightgreen" : "grey",
  ...draggableStyle
});

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function App() {
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  const [ password, setPassword ] = useState('');
  const [ films, setFilms ] = useState([]);

  const loadStills = ()=> fetch('/test/film-list').then(response => response.json())
                                                  .then(stills=> setFilms( groupStills(stills.Contents) ));

  const login = ()=> fetch('/test/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })

  }).then(response => response.status > 400 ? console.error(401) : setIsLoggedIn( true ))
    .then(loadStills);
  
  const upload = ()=>{

    const file = document.querySelector('input[type=file]').files[0];
    
    fetch('/test/s3-upload', { method: 'POST', body: JSON.stringify({ filename: file.name }), credentials: 'include' })
      .then(response=> response.text())
      .then(url=> {
        
        const body = new FormData();
        body.append('file', file);

        futch(url, {
          method: 'PUT',
          body,
          headers: { "Content-Type": "multipart/form-data" },
          
        }, e=> {
          console.log('uploaded', e.loaded / e.total, '%');
          
        }).then(res=> (console.log('upload done'), loadStills()))
          .catch(err=> console.log('upload failed with', err));
      });
  };

  const onDragEnd = result => {
    if (!result.destination) return;

    const nextFilms = reorder(
      films,
      result.source.index,
      result.destination.index
    );

    setFilms(nextFilms);
  };
  
  return (
    <div className="App">
      <header className="App-header">
        { !isLoggedIn ? (
            <>
              <label>
                What's the password?
                <input onChange={e=> setPassword(e.target.value)} value={password} type='password'/>
              </label>
              <button onClick={login}>Log in</button>
            </>
        ) : (
            <div className='logged-in'>
              <input type='file'/>
              <button onClick={upload}>
                Upload
              </button>

              
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}>
                      
                      {films.map((film, fi) => (
                        <Draggable key={film.slug} draggableId={film.slug} index={fi}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                              )}
                              >
                              <div className='film-strip'>
                                <div className='edge'/>
                                <div className='strip'>
                                  {
                                    film.stills.map(still => (
                                      <div key={still} className='cell'>
                                        {still}
                                        <img alt=''
                                             src={'https://3k92h7oq73.execute-api.us-west-2.amazonaws.com/test/files?key='+still}/>
                                      </div>
                                    ))
                                  }
                                </div>
                                <div className='edge'/>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
        )}
      </header>
    </div>
  );
}

export default App;
