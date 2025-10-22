/**
 * @file Defines Mongoose schemas and models for Movies and Users.
 * 
 * @requires mongoose
 * @requires bcrypt
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Movie schema defining the structure of a movie document.
 * 
 * 
 * @property {string} Title - The title of the movie (required).
 * @property {object} Genre - The genre of the movie, with name and description.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - The description of the genre.
 * @property {Array<Object>} Director - An array of director objects.
 * @property {string} Director.Name - The name of a director.
 * @property {string} Director.Bio - The biography of the director.
 * @property {date} Director.BirthYear - The birth year of the director.
 * @property {Array<string>} Actors - An array of actors featured in the movie.
 * @property {string} Description - A brief desctiption of the movie (required).
 * @property {string} ImagePath - The URL to the movie's image.
 * @property {boolean} Featured - Indicates if the movie is featured.
 * 
 */
let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String
    },
    Director: [{
        Name: String,
        Bio: String,
        BirthYear: Date
    }],
    Actors: [String],
    Description: { type: String, required: true },
    ImagePath: String,
    Featured: Boolean
});

/**
 * User schema defining the structure of the user document.
 * 
 * @property {string} Username - The user's username (required).
 * @property {string} Password - The user's password (required).
 * @property {string} Email - The user's email (required).
 * @property {date} Birthday - The user's birth date.
 * @property {Array<ObjectId>} - An array of ObjectId references to the user's favorited movies.
 */
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Hashes a user's password before saving it to the database.
 * 
 * @function
 * @param {string} password - The user's password. 
 * @returns {string} - The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * Validates a user's password during login.
 * 
 * @function
 * @param {string} password - The password provided by the user during login. 
 * @returns {boolean} - Returns true if the password is correct, otherwise false.
 */
userSchema.methods.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.Password);
};


/**
 * Mongoose model for Movies, using the movieSchema.
 * @typedef {Object} Movies
 */
let Movies = mongoose.model('Movies', movieSchema);

/**
 * Mongoose model for Users, using the userSchema.
 * @typedef {Object} Users
 */
let Users = mongoose.model('Users', userSchema);

module.exports.Movie = Movies;
module.exports.User = Users;




