import React, { useState, useEffect } from 'react';
import './App.css';

import { futch } from './futch';

import stub from './stub';


const url = 'testing url';

function App() {
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  const [ password, setPassword ] = useState('');
  const [ films, setFilms ] = useState([]);
  
  const login = ()=> Promise.resolve().then(()=> setIsLoggedIn( true ));


  useEffect(()=> setFilms( stub.Contents ), []);

  const upload = ()=>{
    const body = new FormData();
    body.append(
      'file',
      document.querySelector('input[type=file]').files[0]
    );

    futch(url, {
      method: 'PUT',
      body,
      headers: { "Content-Type": "multipart/form-data" },
      
    }, e=> {
      console.log('uploaded', e.loaded / e.total, '%');
      
    }).then(res=> console.log('upload done'))
     .catch(err=> console.log('upload failed with', err));
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
              {
                films.map(film => (
                  <div key={film.Key}>{film.Key}</div>
                ))
              }
            </div>
        )}
      </header>
    </div>
  );
}

export default App;
