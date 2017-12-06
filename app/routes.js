

/*
*
* SWE-681 programming project Fall-2017
* Author: Rohit Tirmanwar, Rohitaksh Vanaparthy
* File: app/routes.js
*/

// The purpose of this fuile is to handle all the client request
// The first interaction happens ere when the client sends a request to the server

var boardObj = require('./queries');
var gamePlay = require('./gameplay');
var controller = require('./controller');
var postController = require('./post-controller');

module.exports = function(app, passport, board) {


	// Index page (with login links)
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});


	// LOGIN
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('login', {
            successRedirect : '/launch', // redirect to the secure launch section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
			}
        res.redirect('/');
    });

	// SIGNUP
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('signup', {
		successRedirect : '/launch', // redirect to the secure launch section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// PROFILE SECTION
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {

		if (req.query.request == "userGamesHistory") {
			controller.processUserProfileRequest(req, res);
		} else {
			res.render('profile.ejs', {
				username : req.user.username
			});
		}

	});

	// LOGOUT
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	// After Login Launch Page
	app.get('/launch', isLoggedIn, function(req, res) {
		// console.log(req);
		if (req.query && req.query.request) {
			if (req.query.request == "ExistingGames") {
				controller.processExistingGamesRequest(req, res);

			} else if (req.query.request == "JoinExistingGame" && req.query.gameTitle) {

				// Add regex for board/game name
				var re = RegExp('^[A-Za-z0-9-_]*$');
				if (req.query.gameTitle != "" && true == re.test(req.query.gameTitle)) {
					controller.processJoinExistingGameRequest(req, res);
				} else {
					res.status(401).send("Invalid Game Title..");
				}

			} else if (req.query.request == "isContinueGame") {
				controller.checkIfUserIsCurrentlyPlayingGame(req, res);
			}
		} else {
			res.render('launch.ejs', {
				username : req.user.username
			});
		}
	});

	app.post('/launch', isLoggedIn, function(req, res) {
		if (req.body && req.body.request == "CreateNewGame") {

			// Add regex for board/game name
			var re = RegExp('^[A-Za-z0-9-_]+$');
			if (req.body.gameTitle && true == re.test(req.body.gameTitle)) {
				postController.processCreateNewGameRequest(req, res);
			} else {
				res.status(401).send("Invalid Game Title");
			}

		}

	});

	// GAME BOARD
    app.get('/board', isLoggedIn, function(req, res) {

		// var _this = this;
		if (req.query && req.query.request) {

			if (req.query.request == "currentPlayingGame") {
				controller.processUserPlayingGameRequest(req, res);

			} else if (req.query.request == "isMyTurn") {
				controller.processIsMyTurnRequest(req, res);

			} else if (req.query.request == "startGame") {

				controller.processStartGameRequest(req, res);

			} if (req.query.request == "boardStatus") {
				// Add regex for board/game name
				var re = RegExp('^[A-Za-z0-9-_]+$');

				if (req.query.boardName && true == re.test(req.query.boardName)) {
					var boardName = req.query.boardName;
					boardObj.getUserBoardStatus(boardName, userName, function(err, data) {
						if (err) {
							res.status(500).send("Internal server error");
						} else {
							res.status(200).send(data);
						}
					});
				} else {
					res.status(401).send("Invalid Board Name..");
				}

			} else if (req.query.request == "forfeitGame") {
				controller.forfeitGameRequest(req, res);
			}

		} else {
			res.render('board.ejs', {
				username : req.user.username
			});
		}
	});

	app.post('/board', isLoggedIn, function(req, res) {

		if (req.body) {

			if (req.body.request == "addMove") {
				// add regex for move value. Value showld have only 2 digits each between 1-6
				var re = RegExp('^[1-6][1-6]$');
				var moveValue = req.body.value;
				if (true == re.test(""+moveValue)) {
					postController.processAddMoveRequest(req, res);
				} else {
					console.log("Invalid move input value");
					res.status(401).send("Invalid Move");
				}
			}
		}

	});



};

// route middleware to make sure of authentication
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}




