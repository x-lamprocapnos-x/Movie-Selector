const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

let movieSchema = mongoose.Schema({
    Title: {type: String, required:true},
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
    Description: {type: String, required:true},
    ImagePath: String,
    Featured: Boolean 
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

let Movies = mongoose.model('Movies', movieSchema);
let Users = mongoose.model('Users', userSchema);

module.exports.Movie = Movies;
module.exports.User = Users;