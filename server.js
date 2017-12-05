

/*
*
* SWE-681 programming project Fall-2017
* Author: Rohit Tirmanwar, Rohitaksh Vanaparthy
* File: server.js
*/


// This is the main server file which will be insitialized to start the server

// set all the dependencies
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Tool for logging
var morgan = require('morgan');

// Passport for authentication
var passport = require('passport');
var flash    = require('connect-flash');

// Secure HTTPS
var https = require('https');
var fs = require('fs');

// DATABASE connection
var mysql = require('mysql');
var dbconfig = require('./config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

// Passport initialization
require('./config/passport')(passport, connection); // pass passport and sql connection for configuration


// get the variables
var app = express();
var port = 3010;


// set up the express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// Set view engine (client side files rendering)
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'somesecretofprojectswe681passportnodejsgameproject',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// Initialize routing
var routing = require('./app/routes')(app, passport); // load our routes and pass in our app and fully configured passport

// ssl/tsl secure key and self-signed certificate generated using openssl
// This ensures the secure https connection
var options = {
	key  : fs.readFileSync('server.key'),
	cert : fs.readFileSync('server.crt')
 };

// Start the server using https
https.createServer(options, app).listen(port, function (err) {
if (err) {
	return console.log('something bad happened', err)
	}
	console.log(`server is listening on ${port}`)
});


// Set the admin user
// var boardObj = require('./app/queries');
// boardObj.setUserRole("admin", "ADMIN", function(err, data) {

// });




