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

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
// set Session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: true,
    })
);
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

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
app.get('/welcome', (req, res) => {
    res.json({ status: 'success', message: 'Welcome!' });
});

app.get('/test', (req, res) => {
    res.redirect('pages/login.hbs');
});

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


// adding paths to nav_bar pages
app.get('/authors', async (req, res) => {
    res.render('pages/authors.hbs')
});

app.get('/projects', async (req, res) => {
    res.render('pages/projects.hbs')
});

app.get('/majors', async (req, res) => {
    res.render('pages/majors.hbs')
});

app.get('/groups', async (req, res) => {
    res.render('pages/groups.hbs')
});

app.get('/security', async (req, res) => {
    const temp  = req.session.user.username;
    const temp2 = 'Cyber Security';
    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
    .then(async data => {
        if (data != null && data.length > 0)
        {
            console.log('ran query');
            console.log(data);
            res.render('pages/security.hbs'); 
        }
        else
        {
            res.render("pages/groups.hbs", {
                message: 'Please join a group to view it.'
            });
            console.log('failed query');
        }
    })
    .catch(err => {
        console.log('ran query');
        console.log(err);
    });
});

app.post('/security', async (req, res) => {
    const temp  = req.session.user.username; //username
    const temp2 = 'Cyber Security'; // group name to join
    const query = 'INSERT INTO user_category (username, category_name) VALUES ($1, $2)';

    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
    .then(async data => {
        if (data === null || data.length === 0)
        {
            console.log('ran query');
            console.log(data);
            console.log(query)
            await db.any(query, [temp, temp2])
            .then(async data => {
                console.log('ran query');
                console.log(data);
                res.render('pages/security.hbs'); 

            })
            .catch(err => {
                res.render("pages/groups.hbs", {
                    message: 'Failed to join.'
                });
                console.log('ran query');
                console.log(err);
            });
        }
        else
        {
            res.render("pages/groups.hbs", {
                message: 'Already joined this group.'
            });
            console.log('failed query');
        }
    })
    .catch(err => {
        console.log('ran query');
        console.log(err);
    });

});

app.get('/software', async (req, res) => {
    const temp  = req.session.user.username;
    const temp2 = 'Software Development';
    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
    .then(async data => {
        if (data != null && data.length > 0)
        {
            console.log('ran query');
            console.log(data);
            res.render('pages/software.hbs'); 
        }
        else
        {
            res.render("pages/groups.hbs", {
                message: 'Please join a group to view it.'
            });
            console.log('failed query');
        }
    })
    .catch(err => {
        console.log('ran query');
        console.log(err);
    });
});

app.post('/software', async (req, res) => {
    const temp  = req.session.user.username; //username
    const temp2 = 'Software Development'; // group name to join
    const query = 'INSERT INTO user_category (username, category_name) VALUES ($1, $2)';

    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
    .then(async data => {
        if (data === null || data.length === 0)
        {
            console.log('ran query');
            console.log(data);
            console.log(query)
            await db.any(query, [temp, temp2])
            .then(async data => {
                console.log('ran query');
                console.log(data);
                res.render('pages/software.hbs'); 

            })
            .catch(err => {
                res.render("pages/groups.hbs", {
                    message: 'Failed to join.'
                });
                console.log('ran query');
                console.log(err);
            });
        }
        else
        {
            res.render("pages/groups.hbs", {
                message: 'Already joined this group.'
            });
            console.log('failed query');
        }
    })
    .catch(err => {
        console.log('ran query');
        console.log(err);
    });

});


app.get('/home', async (req, res) => {
    res.render('pages/home', {
        username: req.session.user.username
    });
});

app.post('/user_projects', async (req, res) => {
    const query = `SELECT 
    projects.project_name,
    projects.project_description
    FROM
        projects
        JOIN user_projects ON projects.project_name = user_projects.project_name
        JOIN users ON users.username = user_projects.username
        WHERE users.username = $1
        ORDER BY projects.project_name ASC;`;
    // Query to list all the courses taken by a student

    await db.any(query, [req.body.username])
        .then(async data => {
            console.log('ran query');
            console.log(data);
            res.render('pages/user_projects', {
                data
            });
        })
        .catch(err => {
            console.log('ran query');
            console.log(err);
        });
});

// Register
app.post('/register', async (req, res) => {

    //hash the password using bcrypt library
    const hashed = await bcrypt.hash(req.body.password, 10);

    const query = `INSERT INTO users (username,password) VALUES ($1,$2)`;

    try {
        if ((req.body.username).includes(1) ||
            (req.body.username).includes(2) ||
            (req.body.username).includes(3) ||
            (req.body.username).includes(4) ||
            (req.body.username).includes(5) ||
            (req.body.username).includes(6) ||
            (req.body.username).includes(7) ||
            (req.body.username).includes(8) ||
            (req.body.username).includes(9) ||
            (req.body.username).includes(0)) {
            junk.fail;
        } else {
            await db.any(query, [req.body.username, hashed])
            res.render('pages/login', {
                message: 'Registration successful'
            });
            console.log('successfully added')
            res.status(200);
        }
    }
    catch (err) {
        res.render("pages/register", {
            message: 'Registration failed'
        });
        res.status(500);
        console.log(err);
        console.log('register failed');
    }

});

app.post('/register.json', async (req, res) => {
    //hash the password using bcrypt library
    const hashed = await bcrypt.hash(req.body.password, 10);

    const query = `INSERT INTO users (username,password) VALUES ($1,$2)`;

    try {
        if ((req.body.username).includes(1) ||
            (req.body.username).includes(2) ||
            (req.body.username).includes(3) ||
            (req.body.username).includes(4) ||
            (req.body.username).includes(5) ||
            (req.body.username).includes(6) ||
            (req.body.username).includes(7) ||
            (req.body.username).includes(8) ||
            (req.body.username).includes(9) ||
            (req.body.username).includes(0)
        ) {
            junk.fail;
        } else {
            await db.any(query, [req.body.username, hashed]);

            res.json({
                status: 'success',
                message: 'Registration successful'
            });
        }
    }
    catch (err) {
        res.json({
            status: 'failure',
            message: 'Registration failed'
        });
    }
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
                res.render('pages/home.hbs', {
                    username: user.username,
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



// added duplicate of login for testing
app.post('/login.json', async (req, res) => {
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
                res.json({
                    message: 'Login failed'
                });
                //return console.log('incorrect username or password');
            }
            else {
                res.json({
                    message: 'Login successful'
                });
                res.status(401);
                req.session.user = user;
                req.session.save();
                //     return console.log('correct username or password');
            }
        })
        // if query execution fails
        // send error message
        .catch(function (err) {
            return console.log('query failed' + '\n' + err);
        });
});

app.post('/add_project', async (req, res) => {
    const query = `INSERT INTO projects (project_name,project_description) VALUES ($1,$2); INSERT INTO user_projects (username, project_name) VALUES ($3,$1)`;
    console.log(req.body.project_name, req.body.project_description, req.body.username);
    try {
        await db.any(query, [req.body.project_name, req.body.project_description, req.body.username])
        res.render('pages/home', {
            username: user.username,
            message: 'Added project successful'
        });
        console.log('successfully added')
        res.status(200);

    }
    catch (err) {
        res.render("pages/home", {
            username: user.username,
            message: 'Adding project failed'
        });
        res.status(500);
        console.log(err);
        console.log('adding failed');
    }
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
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');