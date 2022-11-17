const express = require('express');
const app = express();

app.get('/', (_req, res)=>{
    res.send('welcome to your movie selector!')
});

app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
  });

  app.get('/movies', (req, res) => {
    res.json('/movies');
  });