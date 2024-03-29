const passport = require('passport'),
    LocalStragedy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt'),
    config = require("./config.js");


let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStragedy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + ' ' + password);
    Users.findOne({ Username: username }, (error, user) => {
        if (error) {
            console.log(error);
            return callback(error);
        }
        if (!user) {
            console.log('incorrect username');
            return callback(null, false, { message: 'incorrect username' });
        }
        if (!user.validatePassword(password)) {
            console.log('incorrect password');
            return callback(null, false, { message: 'incorrect password' })
        }
        console.log('finished');
        return callback(null, user);
    });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),

    secretOrKey: config.JWT_SECRET
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });

}));