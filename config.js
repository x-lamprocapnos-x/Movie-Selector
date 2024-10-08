/**
 * @file Configuration file that exports database connection URI and JWT secret.
 * 
 * @module config
 */

/**
 * Conficuration object containing environment variables for database connection and JWT secret.
 * 
 * @property {string} CONNECTION_URI - The URI for MongoDB database connection. Defaults to "mongodb://localhost:27017" if not provided in envitonment variables.
 * @property {string} JWT_SECRET - The secret key for signing JWT tokens. Defaults to "your_jwt_secret" if not provided in environment variables.
 */

const config = {
    CONNECTION_URI: process.env.CONNECTION_URI || "mongodb://localhost:27017",
    JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret"
}
module.exports = config