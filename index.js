const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost:27017/db',{ useNewUrlParser: true, useUnifiedTopology: true })

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
//const passport = require('passport');
//require('./passport');
//const cors = require('cors');
//app.use(cors());
//let auth = require('./auth')(app);
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.urlencoded({ extended: true }));
// 
app.get('/', (req, res) => {
    res.send('welcome to your movie selector');
});
// read documentation   
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//read all movies 
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
//read movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),
(req, res) => {
    const { title } = req.params;
    const movie = Movies.find(movies => movies.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('movie not found')
    }

});
//read movie genre by name
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }),
(req, res) => {
    const { genreName } = req.params;
    genre = Movies.Genre.find(item => item.Name === genreName);
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(404).send('genre not found')
    }

});
//read director by name
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }),
(req, res) => {
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
// get single user
app.get('/users/:username', passport.authenticate('jwt', { session: false }),
(req, res) => {
    Users = Users.findOne({ Username: req.params.username })
        .then((Users) => {
            res.status(201).json(Users)
        }).catch(err => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        });

});
// update user
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
//delete user
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
// create new user
app.post('/users',  
  [
    check('Username', 'Username is required').isLength({min:8}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let errors = validationResults(req);
    if (!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password)
    Users.findOne({ Username: req.params.Username })
        .then((Users) => {
            if (!Users) {
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
                        res.status(500).send('Error: ', err);
                    })

            }
        })
});
// Add a movie to a user's list of favorites
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

app.listen(8082, () => {
    console.log('listening on port 8082');
});