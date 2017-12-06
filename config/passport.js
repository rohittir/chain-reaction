/*
*
* SWE-681 programming project Fall-2017
* Author: Rohit Tirmanwar, Rohitaksh Vanaparthy
* File: config/passport.js
*/

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var bcrypt = require('bcrypt-nodejs');


// expose this function to our app using module.exports
module.exports = function(passport, connection) {

    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // This adds the layer of authentication security

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // We are using local login strategy
    // This handles the sign up request of the user
    passport.use(
        'signup',
        new LocalStrategy({
            // by default, local strategy uses username and password
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            // check the conditions for username with regex
            var re = RegExp('^[A-Za-z0-9_.]+$');
            if (false == re.test(username)) {
                return done(null, false, req.flash('signupMessage', 'That username is not valid.'));
            }

            // find a user whose username is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create a new user
                    var newUserMysql = {
                        username: username,
                        // using the generateHash function in our user model. We will store the hash generated code in our database
                        // This API generates the salt with default 10 rounds
                        password: bcrypt.hashSync(password, null, null)
                    };

                    // Insert the user row into database table
                    var insertQuery = "INSERT INTO users ( username, password, role ) values (?,?,\"PLAYER\")";

                    // Avoid SQL Injection queries by using this API of queries
                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;
                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // Handles Login requests
    passport.use(
        'login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with username and password from our form
             // check the conditions for username with regex
             var re = RegExp('^[A-Za-z0-9_.]+$');
             if (false == re.test(username)) {
                 return done(null, false, req.flash('signupMessage', 'No user found.'));
             }

            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                // compares salted hash passwords
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );

};












