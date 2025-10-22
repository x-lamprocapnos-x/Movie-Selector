/**
 * @file Passport authentication strategies for local and JWT authentication.
 * 
 * @requires passport
 * @requires passport-local
 * @requires passport-jwt
 * @requires ./models.js
 * @requires ./config.js
 */

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt'),
    config = require("./config.js");


let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

/**
 * Local strategy for authenticating users using a username and password.
 * 
 * @param {string} usernameField - Field in the request body that contains the username.
 * @param {string} passwordField - Field in the request body that contains the password.
 * @callback authenticateUser
 * @param {string} username - The username provided by the user.
 * @param {string} password - The password provided by the user.
 * @param {function} callback - A callback function to return the authenticated user or error.
 */
passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, async (username, password, callback) => {
    try {
        console.log('Authenticating:', username);

        const user = await Users.findOne({ Username: username });

        if (!user) {
            console.log('Incorrect username');
            return callback(null, false, {message: 'Incorrect username' });
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            console.log('Incorrect password');
            return callback(null, false, { message: 'Incorrect password' });
        }

        console.log('Authentication successful');
        return callback(null, user);
    
    } catch (error) {
        console.log('Error during authenticaition:', error);
        return callback(error);
    }

}));

/**
 * JWT strategy for authenticating users using a JWT token.
 * 
 * @param {object} jwtPayload - The payload decoded from the JWt token, containing user information.
 * @param {function} callback - A callback function to return the authenicated user or error.
 */

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET,
    algorithms: ['HS256']
}, async (jwtPayload, callback) => {
    try{
        const user = await Users.findById(jwtPayload._id);
        if (!user)return callback(null, user);
        return callback(null, user);
    } catch (error) {
        console.log('Error during JWT authentication:', error);
        return callback(error);
    }

}));