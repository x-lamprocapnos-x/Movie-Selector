const express = require('express'),
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (_req, res) => {
    res.send('welcome to your movie selector');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});
//read all movies
const movies = require('./movies.json')
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});
//read movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movies => movies.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('movie not found')
    }

});

app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    //const genre = movies.find(movies => movies.Genre.Name === genreName).Genre;
    let genre;
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        genre = movie.Genre.find(item => item.Name === genreName);
        if (genre) break;
    }

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(404).send('genre not found')
    }

});

app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    let director;
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        director = movie.Director.find(item => item.Name === directorName);
        if (director) break;
    }

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(404).send('director not found')
    }

});



app.listen(8080, () => {
    console.log('listening');
})

app.get("/movies")