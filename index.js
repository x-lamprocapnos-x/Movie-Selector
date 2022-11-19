const express = require('express'),
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.get('/', (_req, res) => {
    res.send('welcome to your movie selector!')
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

const movies = require('./movies.json')
app.get('/movies', (req, res) => {
    res.json({ movies: movies });
    //res.json('/movies')
});

app.use(express.static('public'));

app.listen(8080, () => {
    console.log('listening');
})