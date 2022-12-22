const mongoose = require('mongoose');
const newLocal = 'mongodb://localhost:27017/db';
mongoose.connect(newLocal, { useNewUrlParser: true, useUnifiedTopology: true });

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const express = require('express'),
    morgan = require('morgan')
const app = express();
app.use(express.static('public'));
app.use(morgan('common'));

const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

app.get('/', (req, res) => {
    res.send('welcome to your movie selector');
});
// read documentation   
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//read all movies 
app.get('/movies', (req, res) => {
    Movies.find()
        .then(movies => {
            res.json(movies)
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error: ' + err);
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
    for (let i = 0; i < Movies.length; i++) {
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
    Users.find()
        .then((Users) => {
            res.status(201).json(Users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
// get single user
app.get('/users/:username', (req, res) => {
    Users = Users.findOne({ Username: req.params.username })
        .then((Users) => {
            res.status(201).json(Users)
        }).catch(err => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        });

});
// update user
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});
//delete user
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((Users) => {
            if (!Users) {
                res.status(400).send(req.params.Username + ' Was not found');
            } else {
                res.status(200).send(req.params.Username + ' Was deleted');
            }
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err)
        })

});
// create new user
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((Users) => {
            if (!Users) {
                return res.status(400).send(req.body.Username + 'already Exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {
                        res.status(201).json(user)
                    }).catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ', err);
                    })

            }
        })
});
// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

app.listen(8081, () => {
    console.log('listening');
});