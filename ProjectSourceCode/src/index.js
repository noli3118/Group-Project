// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const user = {
    username: undefined,
    password: undefined,
};

const db = pgp(dbConfig);

// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here
app.get('/', (req, res) => {
    res.render('pages/login.hbs'); //this will call the /anotherRoute route in the API
});
app.get('/register', (req, res) => {
    res.render('pages/register.hbs')
});

app.get('/login', async (req, res) => {
    res.render('pages/login.hbs')
});

app.get('/logout', async (req, res) => {
    res.render('pages/logout.hbs')
});

app.get('/discover', async (req, res) => {
    process.env.API_KEY = 'FQpannHAjd1zzUqV7pC037anK1M7NLdY';
    axios({
        url: `https://app.ticketmaster.com/discovery/v2/events.json`,
        method: 'GET',
        dataType: 'json',
        headers: {
            'Accept-Encoding': 'application/json',
        },
        params: {
            apikey: process.env.API_KEY,
            keyword: 'Taylor Swift', //you can choose any artist/event here
            size: '10', // you can choose the number of events you would like to return
        },
    })
        .then(results => {
            console.log(results.data); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
        })
        .catch(error => {
            // Handle errors
            console.log(error);
            //            res.redirect('/login');
        });
    res.render('pages/discover.hbs')
});

// Register
app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);

    // To-DO: Insert username and hashed password into the 'users' table
    const query = `INSERT INTO users(username, password) VALUES ($1, $2) RETURNING * ;`;
    db.any(query, [
        req.body.username,
        hash
    ])
        // if query execution succeeds
        // send success message
        .then(function (data) {
            res.render('pages/login');
        })
        // if query execution fails
        // send error message
        .catch(function (err) {
            res.render('pages/register');
        });
});

// Login
app.post('/login', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);

    // To-DO: Insert username and hashed password into the 'users' table
    const query = `SELECT *
                FROM users
                WHERE username = $1
                LIMIT 1;`;

    console.log(query);
    console.log(req.body.username);
    db.one(query, [req.body.username])
        //    if query execution succeeds send success message
        .then(async data => {
            let valid = await bcrypt.compare(req.body.password, data.password);
            user.username = req.body.username;
            user.password = req.body.password;
            if (!valid) {
                res.render('pages/login.hbs', {
                    message: `Incorrect username or password`,
                });
                //return console.log('incorrect username or password');
            }
            else {
                res.render('pages/discover.hbs', {
                    message: `Login successful`
                });
                req.session.user = user;
                req.session.save();
                //     return console.log('correct username or password');
            }
        })
        // if query execution fails
        // send error message
        .catch(function (err) {
            res.render('pages/register.hbs', {
                message: `No account found. Please register for one`,
            });
            return console.log('query failed' + '\n' + err);
        });
});

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
        // Default to login page.
        return res.redirect('/login');
    }
    next();
};

// Authentication Required
app.use(auth);

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');