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

// 4/16 4:45 Neena added these two packages for IMAGING 
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // files will be saved to 'uploads' folder


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

// Serve static files from the 'public' directory
//4/16 7:47 Neena added this line to serve files from the 'public' directory
app.use(express.static(path.join(__dirname, 'resources')));

// 4/16 4:52 Neena added this line to serve files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Mock user middleware for testing
app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = {
            username: 'testuser',
            major_name: 'Computer Science' // Replace with suitable default values
        };
    }
    next();
});


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
    major_name: undefined,
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

// Route for liking a project - Neena added 4/16 10:57
app.post('/projects/:projectName/like', async (req, res) => {
    const projectName = req.params.projectName;
    const username = req.session.user.username; // Assuming you have the user in the session

    const query = `
        INSERT INTO project_likes (project_name, username)
        VALUES ($1, $2)
        ON CONFLICT (project_name, username) 
        DO NOTHING;`; // This avoids inserting a like if it already exists

    try {
        await db.none(query, [projectName, username]);
        res.json({ success: true, message: 'Project liked successfully' });
    } catch (err) {
        console.error('Error while liking project:', err);
        res.status(500).json({ success: false, message: 'Failed to like project' });
    }
});


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

app.post('/search', (req, res) => {
    res.render('pages/search', {
        search_string: req.body.search_string,
        search_category: req.body.search_category
    });
});

// adding paths to nav_bar pages
//Neena added block on get authors 4/16 11:19
app.get('/authors', async (req, res) => {
    const authorsQuery = `
      SELECT u.username, m.major_name, json_agg(json_build_object('project_name', p.project_name, 'project_image', p.project_image)) AS projects
      FROM users u
      LEFT JOIN user_majors m ON u.username = m.username
      LEFT JOIN user_projects up ON u.username = up.username
      LEFT JOIN projects p ON up.project_name = p.project_name
      GROUP BY u.username, m.major_name;
    `;

    try {
        const authorsData = await db.any(authorsQuery);
        // Making sure projects are displayed even if they are null
        const authors = authorsData.map(author => ({
            ...author,
            projects: author.projects[0].project_name ? author.projects : []
        }));

        res.render('pages/authors', {
            layout: 'main',
            authors: authors
        });
    } catch (err) {
        console.error('Error fetching authors:', err);
        res.render('pages/error', {
            layout: 'main',
            message: 'Failed to load authors'
        });
    }
});



//Neena added this block to implement the projects page 4/16 8:08
app.get('/projects', async (req, res) => {
    const query = `
        SELECT p.project_name, p.project_description, p.project_image, COUNT(pl.username) AS like_count
        FROM projects p
        LEFT JOIN project_likes pl ON p.project_name = pl.project_name
        GROUP BY p.project_name
        ORDER BY p.project_name ASC;`;

    try {
        const projects = await db.any(query);
        res.render('pages/projects', {
            layout: 'main', // Assuming 'main' is your default layout file
            projects: projects  // This is the data from your query
        });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.render('pages/error', {
            layout: 'main', // Assuming 'main' is your default layout file
            message: 'Failed to load projects'
        });
    }
});



app.get('/groups', async (req, res) => {
    res.render('pages/groups.hbs')
});

// Neena added this block for IMAGE PROCESSING 4/16 7:16

// GET route handler for user projects
app.get('/user_projects', async (req, res) => {
    const query = `SELECT 
    projects.project_name,
    projects.project_description,
    projects.project_image
    FROM
        projects
        JOIN user_projects ON projects.project_name = user_projects.project_name
        WHERE user_projects.username = $1
        ORDER BY projects.project_name ASC;`;

    // Replace 'testuser' with the actual username stored in the session
    const username = req.session.user.username;

    await db.any(query, [username])
        .then(data => {
            console.log('User projects fetched successfully');
            console.log(data);
            res.render('pages/user_projects', {
                layout: 'main', // Specify the layout you want to use. You might have a 'main' layout.
                data: data
            });
        })
        .catch(err => {
            console.error('Error fetching user projects:', err);
            res.render('pages/error', {
                layout: 'main', // Specify the layout for the error page
                message: 'Failed to load user projects'
            });
        });
});



//Neena added block for messaging 4/16 11:23

// Route for message form page
app.get('/message/:username', async (req, res) => {
    // Assume you have session handling and you have the logged-in user's username
    const loggedInUsername = req.session.user.username; // Replace with actual session username

    const receiverUsername = req.params.username; // Username of the message receiver

    // Render the message form page for the receiver
    res.render('pages/messages', {
        layout: 'main',
        receiver: receiverUsername,
        sender: loggedInUsername
    });  // This closing bracket and parenthesis were missing
});

app.get('/security', async (req, res) => {
    const temp = req.session.user.username;
    const temp2 = 'Cyber Security';
    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
        .then(async data => {
            if (data != null && data.length > 0) {
                console.log('ran query');
                console.log(data);
                res.render('pages/security.hbs');
            }
            else {
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

app.get('/group/:group_name', async (req, res) => {
    const group_name = req.params.group_name;
    const username = req.session.user.username;

    try {
        // Fetch messages for this group
        const messages = await db.any('SELECT * FROM group_messages WHERE group_name = $1 ORDER BY sent_at DESC', [group_name]);
        // Render the group chat page
        res.render('pages/group_chat', {
            layout: 'main',
            group_name: group_name,
            messages: messages,
            username: username
        });
    } catch (err) {
        console.error('Error getting group messages:', err);
        res.status(500).send('Failed to load group chat.');
    }
});

app.post('/group/:group_name/send_message', async (req, res) => {
    const group_name = req.params.group_name;
    const { message_text } = req.body;
    const sender_username = req.session.user.username;

    try {
        await db.none('INSERT INTO group_messages (group_name, sender_username, message_text) VALUES ($1, $2, $3)', [group_name, sender_username, message_text]);
        res.redirect(`/group/${group_name}`); // Redirect back to the group chat
    } catch (err) {
        console.error('Error sending group message:', err);
        res.status(500).send('Failed to send message.');
    }
});



app.post('/join_group', async (req, res) => {
    const { group_name } = req.body;
    const username = req.session.user.username;

    try {
        const existingMemberCheck = 'SELECT 1 FROM group_members WHERE username = $1 AND group_name = $2';
        const isMember = await db.oneOrNone(existingMemberCheck, [username, group_name]);

        if (!isMember) {
            await db.none('INSERT INTO group_members (username, group_name) VALUES ($1, $2)', [username, group_name]);
            res.redirect(`/group/${group_name}`);
        } else {
            // If the user is already a member of the group, maybe redirect back to the groups page with a message
            res.render("pages/groups.hbs", {
                message: 'You have already joined this group.'
            });
        }
    } catch (err) {
        console.error('Error joining group:', err);
        res.status(500).send('Failed to join group.');
    }
});





app.post('/security', async (req, res) => {
    const temp = req.session.user.username; //username
    const temp2 = 'Cyber Security'; // group name to join
    const query = 'INSERT INTO user_category (username, category_name) VALUES ($1, $2)';

    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
        .then(async data => {
            if (data === null || data.length === 0) {
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
            else {
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
    const temp = req.session.user.username;
    const temp2 = 'Software Development';
    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
        .then(async data => {
            if (data != null && data.length > 0) {
                console.log('ran query');
                console.log(data);
                res.render('pages/software.hbs');
            }
            else {
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
    const temp = req.session.user.username; //username
    const temp2 = 'Software Development'; // group name to join
    const query = 'INSERT INTO user_category (username, category_name) VALUES ($1, $2)';

    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
        .then(async data => {
            if (data === null || data.length === 0) {
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
            else {
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


app.get('/literature', async (req, res) => {
    const temp = req.session.user.username;
    const temp2 = 'Literature and Writing';
    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
        .then(async data => {
            if (data != null && data.length > 0) {
                console.log('ran query');
                console.log(data);
                res.render('pages/literature.hbs');
            }
            else {
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


app.get('/view_messages', async (req, res) => {

    const loggedInUsername = req.session.user.username;

    // SQL query to get messages sent to the logged-in user
    const query = `
        SELECT * FROM messages
        WHERE receiver_username = $1
        ORDER BY sent_at DESC;
    `;

    try {
        const messages = await db.any(query, [loggedInUsername]);
        res.render('pages/view_messages', {
            layout: 'main',
            messages: messages
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.render('pages/error', {
            layout: 'main',
            message: 'Failed to load messages'
        });
    }
});


app.get('/conversation/:username', async (req, res) => {
    const currentUsername = req.session.user.username; // Adjust to get the current logged-in user
    const otherUsername = req.params.username;

    try {
        const messages = await db.any("SELECT * FROM messages WHERE (sender_username = $1 AND receiver_username = $2) OR (sender_username = $2 AND receiver_username = $1)", [currentUsername, otherUsername]);

        const formattedMessages = messages.map(message => {
            return {
                ...message,
                isSent: message.sender_username === currentUsername
            };
        });

        res.render('pages/conversation', { // Include the 'pages/' prefix here
            otherUser: otherUsername,
            messages: formattedMessages,
            user: {
                username: currentUsername // Ensure this is passed to the template for comparison
            }
        });
    } catch (error) {
        // handle error
        console.error('Error fetching conversation:', error);
        res.render('pages/error', { // Include the 'pages/' prefix here
            layout: 'main',
            message: 'Failed to load the conversation'
        });
    }
});



app.post('/literature', async (req, res) => {
    const temp = req.session.user.username; //username
    const temp2 = 'Literature and Writing'; // group name to join
    const query = 'INSERT INTO user_category (username, category_name) VALUES ($1, $2)';

    const validate = 'SELECT category_name FROM user_category WHERE username = $1 AND category_name = $2';

    await db.any(validate, [temp, temp2])
        .then(async data => {
            if (data === null || data.length === 0) {
                console.log('ran query');
                console.log(data);
                console.log(query)
                await db.any(query, [temp, temp2])
                    .then(async data => {
                        console.log('ran query');
                        console.log(data);
                        res.render('pages/literature.hbs');

                    })
                    .catch(err => {
                        res.render("pages/groups.hbs", {
                            message: 'Failed to join.'
                        });
                        console.log('ran query');
                        console.log(err);
                    });
            }
            else {
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
        username: req.session.user.username,
        major_name: req.session.user.major_name
    });
});

app.post('/user_projects', async (req, res) => {
    const query = `SELECT 
    projects.project_name,
    projects.project_description,
    projects.project_image
    FROM
        projects
        JOIN user_projects ON projects.project_name = user_projects.project_name
        JOIN users ON users.username = user_projects.username
        WHERE users.username = $1
        ORDER BY projects.project_name ASC;`;
    // Query to list all the courses taken by a student

    // Added line 175 to include project IMAGE Neena 4/16 6:49

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

// Register - REWRITTEN BY NEENA 4/16 11:09
// app.post('/register', async (req, res) => {

//     //hash the password using bcrypt library
//     const hashed = await bcrypt.hash(req.body.password, 10);

//     const query = `INSERT INTO users (username,password) VALUES ($1,$2); INSERT INTO user_majors (username, major_name) VALUES ($1,$3);`;

//     try {
//         if ((req.body.username).includes(1) ||
//             (req.body.username).includes(2) ||
//             (req.body.username).includes(3) ||
//             (req.body.username).includes(4) ||
//             (req.body.username).includes(5) ||
//             (req.body.username).includes(6) ||
//             (req.body.username).includes(7) ||
//             (req.body.username).includes(8) ||
//             (req.body.username).includes(9) ||
//             (req.body.username).includes(0)) {
//             junk.fail;
//         } else {
//             await db.any(query, [req.body.username, hashed, req.body.major_name])
//             res.render('pages/login', {
//                 message: 'Registration successful'
//             });
//             console.log('successfully added')
//             res.status(200);
//         }
//     }
//     catch (err) {
//         res.render("pages/register", {
//             message: 'Registration failed'
//         });
//         res.status(500);
//         console.log(err);
//         console.log('register failed');
//     }

// });

app.post('/register', async (req, res) => {
    // Hash the password using bcrypt library
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try {
        // Check if username contains numbers using a regex pattern
        if (/\d/.test(req.body.username)) {
            throw new Error('Username should not contain numbers.');
        }

        // Construct the query
        const query = `
            INSERT INTO users (username, password) VALUES ($1, $2);
            INSERT INTO user_majors (username, major_name) VALUES ($1, $3);
        `;

        // Execute the query
        await db.none(query, [req.body.username, hashedPassword, req.body.major_name]);

        // If successful, render the login page with a success message
        res.render('pages/login', {
            message: 'Registration successful'
        });
        console.log('successfully added');

    } catch (err) {
        // If an error occurs, render the register page with an error message
        res.render('pages/register', {
            message: `Registration failed: ${err.message}`
        });
        console.error(err);
    }
});

app.post('/register.json', async (req, res) => {
    //hash the password using bcrypt library
    const hashed = await bcrypt.hash(req.body.password, 10);

    const query = `INSERT INTO users (username,password) VALUES ($1,$2);`;

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
            await db.any(query, [req.body.username, hashed, req.body.major_name]);

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
                JOIN user_majors ON users.username = user_majors.username
                WHERE users.username = $1;`;

    db.one(query, [req.body.username])
        //    if query execution succeeds send success message
        .then(async data => {
            let valid = await bcrypt.compare(req.body.password, data.password);
            user.username = data.username;
            user.password = data.password;
            user.major_name = data.major_name;
            console.log(data);
            if (!valid) {
                res.render('pages/login.hbs', {
                    message: `Incorrect username or password`,
                });
                //return console.log('incorrect username or password');
            }
            else {
                res.render('pages/home.hbs', {
                    username: user.username,
                    major_name: user.major_name,
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
            user.major_name = req.body.major_name;
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

// app.post('/add_project', async (req, res) => {
//     const query = `INSERT INTO projects (project_name,project_description) VALUES ($1,$2); INSERT INTO user_projects (username, project_name) VALUES ($3,$1)`;
//     console.log(req.body.project_name, req.body.project_description, req.body.username);
//     try {
//         await db.any(query, [req.body.project_name, req.body.project_description, req.body.username])
//         res.render('pages/home', {
//             username: user.username,
//             message: 'Added project successful'
//         });
//         console.log('successfully added')
//         res.status(200);

//     }
//     catch (err) {
//         res.render("pages/home", {
//             username: user.username,
//             message: 'Adding project failed'
//         });
//         res.status(500);
//         console.log(err);
//         console.log('adding failed');
//     }
// });


// 4/16 4:49 Neena added this updated add_project block for IMAGING & commented out the previous

app.post('/add_project', upload.single('project_image'), async (req, res) => {
    // Extract the text fields' data and the file info from `req.body` and `req.file`
    const { project_name, project_description, username } = req.body;
    const project_image = req.file ? req.file.filename : null; // This will be the uploaded file's name

    // Construct the database query including the project image
    // You need to ensure that your 'projects' table has a column to store the image filename
    const query = `INSERT INTO projects (project_name, project_description, project_image) VALUES ($1, $2, $3);
                   INSERT INTO user_projects (username, project_name) VALUES ($4, $1);`;

    try {
        // Execute the query with the provided values including the project image filename
        await db.any(query, [project_name, project_description, project_image, username]);

        // Render the home page with a success message
        res.render('pages/home', {
            username: user.username,
            message: 'Added project successful'
        });

        // Log success to the console
        console.log('Project added successfully');
    } catch (err) {
        // Render the home page with an error message if something goes wrong
        res.render("pages/home", {
            username: user.username,
            message: 'Adding project failed'
        });

        // Log the error to the console
        console.log('Error adding project:', err);
    }
});

// Neena added route to handle message submission 4/16 11:32
app.post('/send_message', async (req, res) => {
    const { receiver_username, message_text } = req.body;
    const sender_username = req.session.user.username; // Assume you have session handling

    // SQL query to insert the new message into the 'messages' table
    const query = `
      INSERT INTO messages (sender_username, receiver_username, message_text)
      VALUES ($1, $2, $3);
    `;

    try {
        await db.none(query, [sender_username, receiver_username, message_text]);
        // Redirect or inform the user that the message was sent successfully
        res.redirect('/authors'); // or wherever you want to redirect after sending the message
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).render('pages/error', {
            layout: 'main',
            message: 'Failed to send message'
        });
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