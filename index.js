const mongoose = require('mongoose');
const Models = require('./models.js');

app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const User = Models.User;

const newLocal = 'mongodb://localhost:27017/db';
mongoose.connect(newLocal, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (_req, res) => {
    res.send('welcome to your movie selector');
});
// read documentation
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//read all movies
app.get('/movies', (req, res) => {
    Movies.find().then(movies => {
        res.json(movies)
    })
        .catch(error => {
            console.log(error);
            res.status(500).send(`Error: ${error}`);
        });

});
//read movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = Movies.find(movies => movies.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('movie not found')
    }

});
//read movie genre by name
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    genre = Movies.Genre.find(item => item.Name === genreName);
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(404).send('genre not found')
    }

});
//read director by name
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    let director;
    for (let i = 0; i < movies.length; i++) {
        let movie = Movies[i];
        director = movie.Director.find(item => item.Name === directorName);
        if (director) break;
    }

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(404).send('director not found')
    }

});

// Get all users
app.get('/users', (req, res) => {
    User.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + error);
        });
});
// get single user
app.get('users/username', (req, res) => {

    User = User.findOne({Username: req.params.Username})
    .then((User) => {
        res.status(201).json(User)
    }).catch(error => {
        console.log(error);
        res.status(500).send('Error: ' + error);
    });

});

app.listen(8080, () => {
    console.log('listening');
});