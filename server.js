// server.js


// set all the dependencies
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = 3010;

var passport = require('passport');
var flash    = require('connect-flash');

var https = require('https');
var fs = require('fs');

// configuration
// connect to the database
require('./config/passport')(passport); // pass passport for configuration

// set up the express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes set up
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// ssl/tsl secure key and self-signed certificate generated using openssl
var options = {
	key  : fs.readFileSync('server.key'),
	cert : fs.readFileSync('server.crt')
 };

// Start the server
https.createServer(options, app).listen(port, function (err) {
if (err) {
	return console.log('something bad happened', err)
	}
	console.log(`server is listening on ${port}`)
});


