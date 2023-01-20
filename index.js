const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
let connectionString = 'mongodb+srv://newUser:newUser@cluster0.mms86ka.mongodb.net/db?retryWrites=true&w=majority';
let localConnectionString='mongodb://localhost:27017/db'
mongoose.connect(connectionString,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(()=> console.log('connected'))
.catch(e => console.error(e))
const express = require('express');
const app = express();
const { check, validationResult } = require("express-validator");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
require('./passport');
const cors = require('cors');
app.use(cors());
app.use(express.json())
let auth = require('./auth')(app);
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

app.use(express.static('public'));
app.use(morgan('common'));
//app.use(bodyParser.urlencoded({ extended: true }));
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
//read movie genre by name 
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
//read director by name 
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
// get single user .
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
   check('Username', 'Username is required').isLength({min:7}),
   check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
   check('Password', 'Password is required').not().isEmpty(),
   check('Email', 'Email does not appear to be valid').isEmail()
  ], 
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()){
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

const port = process.env.PORT || 8082;
app.listen(port, '0.0.0.0' ,() => {
    console.log('listening on port' + port);
});