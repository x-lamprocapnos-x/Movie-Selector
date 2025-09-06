/**
 * @requires jsonwebtoken
 * @requires passport
 * @requires ./config.js
 * @requires ./passport
 */
const jwt = require('jsonwebtoken'),
  passport = require('passport'),
  config = require('./config.js');

require('./passport'); // local passport file

/**
 * Generates a JWT token for the user.
 * 
 * @param {Object} user - The user object. Should contain at least the `Username` property.
 * @returns {string} - The signed JWT token, valid for 7 days.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, config.JWT_SECRET, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
}

/**
 * Post login endpoint to authenticate a user. 
 * 
 * @param {Object} router - The Express router object.
 * @returns {void} 
 */
module.exports = (router) => {
  /**
   * @function
   * @name /login
   * @description Authenticates user via Passport's local strategy, generates and returns a JWT token.
   * 
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * 
   * @return {Object} JSON object with the user info and JWT token if successful, or error message if unsuccessful.
   */
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: info ? info.message : 'Login failed',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
