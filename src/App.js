import React, { useState, useEffect } from 'react';
import './App.css';

import { futch } from './futch';

import stub from './stub';


const url = 'testing url';

const groupStills = allFiles => {
  const filenames = allFiles.map(file => file.Key).filter(filename=> filename.match(/-out\d+\.png/));

  const slugs = Array.from(new Set(
    filenames.map(filename=> filename.slice(0, filename.lastIndexOf('-out')))
  ));

  return slugs.map(slug => ({ slug, stills: filenames.filter(filename=> filename.match(new RegExp(slug + '-out\\d\\.png'))) }));
};


function App() {
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  const [ password, setPassword ] = useState('');
  const [ films, setFilms ] = useState([]);
  
  const login = ()=> Promise.resolve().then(()=> setIsLoggedIn( true ));


  useEffect(()=> setFilms( groupStills(stub.Contents) ), []);

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

              {films.map(film => (
                <div className='film-strip' key={film.slug}>
                  <div className='edge'/>
                  <div className='strip'>
                    {
                      film.stills.map(still => (
                        <div key={still} className='cell'>
                          <img alt='' src={'https://3k92h7oq73.execute-api.us-west-2.amazonaws.com/test/files?key='+still}/>
                        </div>
                      ))
                    }
                  </div>
                  <div className='edge'/>
                </div>
              ))}
            </div>
        )}
      </header>
    </div>
  );
}

export default App;
