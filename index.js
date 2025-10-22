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
require('./passport');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const passport = require('passport');
const { CONNECTION_URI } = require('./config.js');
const { check, validationResult } = require("express-validator");
const app = express();
const Movies = Models.Movie;
const Users = Models.User;

/**
 * Connects to the MongoDB database using Mongoose
 */
mongoose.connect(CONNECTION_URI)
    .then(() => console.log('connected'))
    .catch(e => console.error(e))

// List of allowed origins for CORS
let allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:1234',
    'https://movie-selector.onrender.com',
    'https://movie-selector-ads.netlify.app',
    'http://localhost:4200',
    'https://x-lamprocapnos-x.github.io'
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
    },
    credentials: true
}));

app.use(express.json()) // Parses incoming requests with JSON payloads
app.use(express.static('public')); // Serves static files from the 'public' directory
app.use(morgan('common')); // Logs HTTP requests to the console
require('./auth')(app); // Import and invoke the auth.js module with the Express app

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
 * @route {GET} /movies/director/:directorName
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
 */
app.post('/users',
    [
        check('Username', 'Username is required').isLength({ min: 7 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            const { Username, Password, Email, Birthday } = req.body;

            // Check if username already exists
            const existingUser = await Users.findOne({ Username });
            if (existingUser) {
                return res.status(400).send(`${Username} already exists`);
            }

            // Hash the password
            const hashedPassword = Users.hashPassword(Password);

            // Create the new user
            const newUser = await Users.create({
                Username,
                Password: hashedPassword,
                Email,
                Birthday
            });

            res.status(201).json(newUser);

        } catch (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        }
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
                res.status(200).json(Users);
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
                res.status(200).json(Users)
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { Username, Password, Email, Birthday } = req.body;

        //find the user first
        let user = await Users.findOne({ Username: req.params.Username });
        if (!user) return res.status(404).send('User not found');

        // Update fields if provided
        user.Username = Username || user.Username;
        user.Password = Password ? Users.hashPassword(Password) : user.Password;
        user.Email = Email || user.Email;
        user.Birthday = Birthday || user.Birthday;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
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
        Users.findOneAndDelete({ Username: req.params.Username })
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
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { Username, MovieID } = req.params;

        // Check if movie exists
        const movie = await Movies.findById(MovieID);
        if (!movie) return res.status(404).send('Movie not found');

        const updatedUser = await Users.findOneAndUpdate(
            { Username },
            { $addToSet: { FavoriteMovies: MovieID } }, // prevents duplicates
            { new: true }
        );

        if (!updatedUser) return res.status(404).send('User not found');
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

/**
 * DELETE: Removes a movie from a user's list of favorites.
 * 
 * @name RemoveFavoriteMovie
 * @route {DELETE} /users/:Username/movies/:MovieID
 * @authentication JWT
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const { Username, MovieID } = req.params;

        // Check if movie exists
        const movie = await Movies.findById(MovieID);
        if (!movie) return res.status(404).send('Movie not found');

        const updatedUser = await Users.findOneAndUpdate(
            { Username },
            { $pull: { FavoriteMovies: MovieID } },
            { new: true }
        );

        if (!updatedUser) return res.status(404).send('User not found');
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});


if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;