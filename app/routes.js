// app/routes.js


var boardObj = require('./board');
var gamePlay = require('./gameplay');


module.exports = function(app, passport, board) {


	// HOME PAGE (with login links)
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
            successRedirect : '/launch', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            // console.log("hello");

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
		successRedirect : '/launch', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// PROFILE SECTION
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
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

					// Access the database for active games
					boardObj.getAllBoardsWaitingForPlayers( function (err, data) {
						console.log(data);
						res.status(200).send(data);
					});

				}
			} else {
				res.render('launch.ejs', {
				});
			}
	});

	app.post('/launch', isLoggedIn, function(req, res) {

		console.log(boardObj);
		if (req.body && req.body.request == "CreateNewGame") {
			if (req.body.gameTitle) {
				if (null != boardObj.createNewBoard(req.body.gameTitle)) {
					var userName = req.user.username;
					console.log(req.user);
					console.log(userName);
					// boardObj.joinBoardPlay(req.body.gameTitle, userName);

					res.status(200).send("Created a new Game...");
				}

			}
		}

	});

	// GAME BOARD
    app.get('/board', isLoggedIn, function(req, res) {
        res.render('board.ejs', {
		});




		// console.log(board);

		// var newBoard = board.createNewBoard("Board1");
		// console.log(newBoard);

		// var player = board.joinBoardPlay("Board1", "testuser1");
		// console.log(player);
	});

	app.post('/board', isLoggedIn, function(req, res) {

		console.log(req.body);

		var userList = [1,2,3,1,2,3,1,2,3,1];
		var movesList = ["12", "43", "56", "12", "43", "56", "12", "43", "56", "12"];

		var boardState = gamePlay.getCurrentBoardState(userList, movesList, 5, 7);

		var data = {};
		data["rows"] = 5;
		data["cols"] = 7;
		data["boardData"] = boardState;
		data["colorData"] = [{"userIndex": 1, "color": "red"}, {"userIndex": 2, "color": "black"}, {"userIndex": 3, "color": "green"}  ];

		// res.setHeader('Content-Type', 'text/json');
		// res.writeHead(200);
		console.log(data);
		res.status(200).send(data);
		// res.write("Sending data from server");
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
