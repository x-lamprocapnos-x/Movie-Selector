/**
 * @file Entry point of Movie Selector API application.
 * 
 * @requires dotenv/config - Loads enviroment variables from a .env file into process.env.
 * @requires mongoose - Provides MongoDB object modeling for the application.
 * @requires express - Express framework for handling HTTP requests and building APIs.
 * @requires express-validator - Middleware for validating incoming request data.
 * @requires cors - Enables Cross-Origin Resource Sharing.
 * @requires morgan - HTTp request logger middleware for node.js.
 * @requires passport - Authentication middleware for node.js.
 * @requires ./models.js - Local models for Movies and Users.
 * @requires ./config.js - Application configuration including database connection and JWT secret.
 */

require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { CONNECTION_URI } = require('./config.js');

/**
 * Connects to the MongoDB database using Mongoose
 */
mongoose.connect(CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('connected'))
    .catch(e => console.error(e))

const express = require('express');
const app = express();
const { check, validationResult } = require("express-validator");
const cors = require('cors');

// List of allowed origins for CORS
let allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:1234',
    'https://movie-selector.onrender.com/movies',
    'https://movie-selector-ads.netlify.app',
    'http://localhost:4200',
    'https://x-lamprocapnos-x.github.io/'
];

/**
 * Middleware for enabling CORS with predefined allowed origins.
 */
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

const morgan = require('morgan');
const passport = require('passport');
require('./passport');

app.use(express.json())
require('./auth')(app);

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

app.use(express.static('public'));
app.use(morgan('common'));

/**
 * GET: Welcome route for the API.
 * 
 * @name Welcome
 * @route {GET} /
 */
app.get('/', (req, res) => {
    res.send('welcome to your movie selector');
});

/**
 * GET: Serves the API documentation.
 * 
 * @name Documentation
 * @route {GET} /documentation 
 */
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});


/**
 * GET: Retrieves all movies.
 * 
 * @name GetMovies
 * @route {GET} /movies
 * @authentication JWT
 */
app.get('/movies', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.find()
            .then(movies => {
                res.json(movies)
            })
            .catch(err => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });

    });

/**
 * Get: Retrieves a single movie by title.
 * 
 * @name GetMovieByTitle
 * @route {GET} /movies/:title
 * @authentication JWT
 */
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { title } = req.params;
        Movies.findOne({ 'Title': title }).
            then(movie => {
                if (movie) {
                    res.status(200).json(movie);
                } else {
                    res.status(404).send('movie not found')
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });
    });

/**
 * GET: Retrieves a movie's genre by genre name.
 * 
 * @name GetGenre
 * @route {GET} /movies/genre/:genreName
 * @authentication JWT
 */
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ 'Genre.Name': req.params.genreName })
            .then(movie => {
                if (movie) {
                    res.json(movie.Genre);
                } else {
                    res.status(404).send('genre not found')
                }
            })
            .catch(error => {
                console.log(error);
                res.status(500).send(`Error: ${error}`);
            })
    });

/**
 * GET: Retrieves a directors information by name.
 * 
 * @name GetDirector
 * @route {GET} /movies/direcor/:directorName
 * @authentication JWT
 */
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ 'Director.Name': req.params.directorName })
            .then(movie => {
                if (movie) {
                    res.json(movie.Director);
                } else {
                    res.status(404).send('director not found')
                }
            })
            .catch(error => {
                console.log(error);
                res.status(500).send(`Error: ${error}`);
            })
    });

/**
 * POST: Creates a new user.
 * 
 * @name CreateUser
 * @route {POST} /users
 *  */
app.post('/users',
    [
        check('Username', 'Username is required').isLength({ min: 7 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password)
        Users.findOne({ Username: req.body.Username })
            .then((User) => {
                if (User) {
                    return res.status(400).send(req.body.Username + 'already Exists');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birthday: req.body.Birthday
                        })
                        .then((user) => {
                            res.status(201).json(user)
                        }).catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ', error);
                        })

                }
            })
    });

/**
 * GET: Retrieves all users.
 * 
 * @name getUsers
 * @route {GET} /users
 * @authentication JWT
 */
app.get('/users', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.find()
            .then((Users) => {
                res.status(201).json(Users);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

/**
 * GET: Retrieves a single user by username.
 * 
 * @name getUserByUsername
 * @route {GET} /users/:username
 * @authentication JWT
 */
app.get('/users/:username', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOne({ Username: req.params.username })
            .then((Users) => {
                res.status(201).json(Users)
            }).catch(err => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });

    });

/**
 * PUT: Updates a user's information by username.
 * 
 * @name UpdateUser
 * @route {PUT} /users/:Username
 * @authentication JWT
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
    (req, res) => {
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

/**
 * DELETE: Deletes a user by username.
 * 
 * @name DeleteUser
 * @route {DELETE} /users/:Username
 * @authentication JWT
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }),
    (req, res) => {
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

/**
 * POST: Adds a movie to a user's list of favorites.
 * 
 * @name AddFavoriteMovie
 * @route {POST} /users/:Username/movies/:MovieID
 * @authentication JWT
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),
    (req, res) => {
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

/**
 * DELETE: Removes a movie from a user's list of favorites.
 * 
 * @name RemoveFavoriteMovie
 * @route {DELETE} /users/:Username/movies/:MovieID
 * @authentication JWT
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, {
            $pull: { FavoriteMovies: req.params.MovieID }
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

/**
 * Starts the API server on the specified port.
 * @name Listen
 * @param {number} port - The port on which the server listens.
 */
const port = process.env.PORT || 8082;
app.listen(port, () => {
    console.log('listening on port' + port);
});