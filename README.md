# **Movie-Selector**
### A RESTful API that provides information about movies, including genres, directors, and user management. It allows users to register, authenticate, and create a list of their favorite movies.

## **Table of Contents**
- Project Overview
- Features
- Technologies Used
- Installation
- Usage
- API Endpoints
- Contributing
- License

## **About the project**
The Movies API is a Node.js and Express application that interacts with a MongoDB database to manage movies and users. It provides endpoints for user registration, authentication, and CRUD operations on movies and user data. The API supports JWT-based authentication to ensure secure access to the endpoints.

## **Features**
- User Registration & Authentication: Register new users, log in existing users, and authenticate requests using JWT.
- Movie Management: Retrieve information on all movies, specific movies by title, genre, or director.
- User Management: View and update user details, including managing a list of favorite movies.
- Secure Endpoints: Protect routes using JWT and Passport.js authentication strategies.

## **Technologies Uses**
- Node.js: JavaScript runtime for building server-side applications.
- Express.js: Web application framework for handling routing and middleware.
- MongoDB & Mongoose: NoSQL database and ODM (Object Data Modeling) for managing data.
- Passport.js: Authentication middleware for Node.js, implementing JWT strategies.
- JSON Web Token (JWT): Securely transmit information between parties as a JSON object.
- CORS: Cross-Origin Resource Sharing configuration for handling requests from different domains.
- dotenv: Load environment variables from a '.env' file.

## **Installation**
1. Clone the repository:
`git clone https://github.com/your-username/movies-api.git`
`cd movies-api`
2. Install dependencies:
`npm install`
3. Set up environment variables:
Create a .env file in the root directory with the following content:
`CONNECTION_URI=your_mongodb_connection_string`
`JWT_SECRET=your_jwt_secret_key`
4. Start the server:
`npm start`
The API will be running on `http://localhost:8082`

## **Usage**
### Endpoints Overview
- GET /movies - Retrieves a list of all movies.
- GET /movies/:title - Retrieves a specific movie by title.
- GET /movies/genre/:genreName - Retrieves the genre details by genre name.
- GET /movies/director/:directorName - Retrieves the director details by name.
- POST /users - Registers a new user.
- POST /login - Authenticates a user and returns a JWT.
- GET /users/:username - Retrieves details of a specific user.
- PUT /users/:Username - Updates user details.
- POST /users/:Username/movies/:MovieID - Adds a movie to a user's list of favorites.
- DELETE /users/:Username/movies/:MovieID - Removes a movie from a user's list of favorites.
- DELETE /users/:Username - Deregisters an existing user.
**Note:** Some endpoints require JWT authentication. Use the token returned from the /login endpoint to access protected routes.

## **Contributing**
### How to Contribute
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes.
4. Ensure your code is properly linted and tested.
5. Submit a pull request with a clear description of your changes.

## **License**
This project is licensed under the ISC License.