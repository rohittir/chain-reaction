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
					if (err) {
						res.status(500).send("Error: Server invalid board error");
					} else {
						console.log(data);
						res.status(200).send(data);
					}
				});
			} else if (req.query.request == "JoinExistingGame" && req.query.gameTitle) {
				// Access the database
				var userName = req.user.username;
				console.log(userName);
				boardObj.joinBoardPlay(req.query.gameTitle, userName, function (err, data) {
					if (err) {
						// res.status(500).send("Error: User already Joined");
						// res.redirect('/board');
						res.status(200).send("Joined the game successfully");
					} else {
						console.log(data);
						res.status(200).send("Joined the game successfully");
						// res.redirect('/board');
					}
				});
			} else if (req.query.request == "forfeitGame") {
				var userName = req.user.username;
				boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
					console.log("getCurrActiveBoardOfUser");
					console.log(data);

					if (err) {
						console.log(err);
						res.status(401).send("Error: User is not active in any game");
					} else {
						if (data && data.length >= 1) {
							var board_name = data[0].board_name;
							boardObj.setUserInActive(userName, board_name, function (err1, data1) {
								console.log(err1);
								console.log(data1);
								if (data1 && !err1) {
									// res.status(200).send("User forfeited...");
									res.render('launch.ejs', {
									});
								} else {
									res.status(401).send("Error: Server internal error");
								}
							});
						}
					}
				});
			}
		} else {
			var userName = req.user.username;

			boardObj.isUserPlayingOnBoard(userName, function(err, data) {
				if (data == true) {
					res.render('board.ejs', {
					});
				} else {
					res.render('launch.ejs', {
					});
				}
			});
		}
	});

	app.post('/launch', isLoggedIn, function(req, res) {

		if (req.body && req.body.request == "CreateNewGame") {
			if (req.body.gameTitle) {
				boardObj.createNewBoard(req.body.gameTitle, function (err, data) {
					if (err) {
						res.status(500).send("Server Error: Board already exists");
					} else {
						var userName = req.user.username;
						console.log(req.user);
						console.log(userName);
						boardObj.joinBoardPlay(req.body.gameTitle, userName, function (err1, data1) {
							if (err1) {
								res.status(500).send("Server Error: Board already exists");
							} else {
								// res.redirect('/board');
								res.status(200).send("Joined the game successfully");
							}
						});
					}
				});
			}

		}

	});

	// GAME BOARD
    app.get('/board', isLoggedIn, function(req, res) {

		// var _this = this;
		if (req.query && req.query.request) {

			if (req.query.request == "currentPlayingGame") {

				var userName = req.user.username;

				boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
					if (err) {
						console.log(err);
						res.status(500).send("Server Error: User is not active in any game");
						// res.redirect('/launch');
					} else {
						console.log(data);
						if (data && data.length >= 1) {
							var board_name = data[0].board_name;

							getAllBoardData(board_name, null, null, function (err1, data1) {
								if (err1) {
									res.status(500).send("Server Error: Invalid board");
								} else {
									console.log(data1);
									res.status(200).send(data1);
								}
							});

						}
					}
				});
			} else if (req.query.request == "isMyTurn") {
				var userName = req.user.username;
				boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
					if (err) {
						console.log(err);
						res.status(500).send("Server Error: User is not active in any game");
						// res.redirect('/launch');
					} else {
						if (data && data.length >= 1) {
							var board_name = data[0].board_name;

							boardObj.isUserTurn(userName, board_name, function(err1, data1) {
								if(err1) {
									res.status(500).send("Server Error: Internal error");
									console.log("Error when user tried to get active status...");
								} else {
									res.status(200).send(data1);
								}
							});
						}
					}
				});
			} else if (req.query.request == "startGame") {

				var userName = req.user.username;
				boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
					console.log("getCurrActiveBoardOfUser");
					console.log(data);

					if (err) {
						console.log(err);
						res.status(401).send("Error: User is not active in any game");
					} else {

						if (data && data.length >= 1) {
							var board_name = data[0].board_name;

							boardObj.getNumUsersOnBoard(board_name, function(err2, data2) {
								if (data2 >= 2 && !err2) {
									console.log("getNumUsersOnBoard");
									console.log(data2);

									boardObj.startBoardPlay(board_name, function(err3, data3) {
										if (!err3 && data3) {
											console.log("startBoardPlay");
											console.log(data3);

											// success
											boardObj.setNextUserTurn(board_name, function (err5, data5) {
												console.log("setNextUserTurn");
												console.log(data5);

												if (err5) {
													res.status(500).send("Server Error: Internal error");
													console.log("Internal error while updating the next tuser's urn");
												} else {
													res.status(200).send("Game started...");
												}
											});

										} else {
											// failed
											res.status(500).send("Error: Unknown server error while starting the game");
										}
									});

								} else {
									// Error: not allowed to start game
									res.status(401).send("Error: At least 2 users required to play the game");
								}
							});


						}
					}
				});

			}

		} else {
			res.render('board.ejs', {
			});
		}
	});

	app.post('/board', isLoggedIn, function(req, res) {

		if (req.body) {

			if (req.body.request == "addMove") {
				var moveValue = req.body.value;
				var userName = req.user.username;

				boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
					if (err) {
						console.log(err);
						res.status(401).send("Error: User is not active in any game");
					} else {
						if (data && data.length >= 1) {
							var board_name = data[0].board_name;

							// Check if this user's turn
							boardObj.isUserTurn(userName, board_name, function(err1, data1) {
								if (!err1 && data1 == true) {
									boardObj.getUserSequence(userName, board_name, function(err2, data2) {
										if (err2) {
											console.log(err);
											res.status(401).send("Error: User is not active in this board");
										} else {
											let userId = data2;

											getAllBoardData(board_name, userId, moveValue, function (err3, data3 ) {
												if (err3) {
													res.status(500).send("Server Error: Invalid board");
												} else {
													console.log(data3);

													// Add move to database
													boardObj.addMoveToBoard(userName, board_name, moveValue, function(err4, data4) {
														console.log("addMoveToBoard");
														console.log(data4);

														if (err4) {
															res.status(500).send("Server Error: Internal error");
														} else {
															boardObj.setNextUserTurn(board_name, function (err5, data5) {
																console.log("setNextUserTurn");
																console.log(data5);

																if (err5) {
																	res.status(500).send("Server Error: Internal error");
																} else {
																	res.status(200).send(data3);
																}
															});
														}

													});
												}
											});

										}

									});

								} else {
									res.status(401).send("Error: It is not this user's turn...");
								}
							});

						}

					}

				});
			}
		}

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


function getAllBoardData(board_name, userID, move, done) {

	var retObject = {};
	var rows = 6;
	var cols = 6;
	retObject["rows"] = rows;
	retObject["cols"] = cols;
	retObject["boardData"] = null;
	retObject["userData"] = null;

	boardObj.getAllMovesOfBoard(board_name, function(err1, data1) {
		if (!err1 && data1) {
			console.log("getAllMovesOfBoard");
			console.log(data1);

			var movesList = [];
			var userIdList = [];
			var boardState = null;
			for (var i = 0; i < data1.length; i++) {
				movesList.push(data1[i].move_value);
				// userIdList.push(0);
				boardObj.getUserSequence(data1[i].username, board_name, function(err2, data2) {
					if (!err2 && data2) {

						console.log("getUserSequence");
						console.log(data2);

						userIdList.push(data2);
						console.log(userIdList);
						console.log(i);
						console.log(data1.length);

						if (userIdList.length == data1.length) { // finished all elements

							if (move && userID) {
								userIdList.push(userID);
								movesList.push(move);
							}

							// Call the function for Board state
							boardState = gamePlay.getCurrentBoardState(userIdList, movesList, rows, cols);
							if (!boardState) {
								done ("Invalid Move", null);
								return;
							}
							retObject["boardData"] = boardState;

							boardObj.getUsersOfBoard(board_name, function (err3, data3) {
								if (!err3 && data3) {

									console.log("getUsersOfBoard");
									console.log(data3);

									var userdata = [];
									for (var j = 0; j < data3.length; j++) {
										userdata.push({"userName": data3[j].username,
										"userIndex": data3[j].user_seq,
										"color": data3[j].colorid ,
										"points": gamePlay.getUserPoints(data3[j].user_seq),
										"winner": false
										});
									}
									retObject["userData"] = userdata;

									done(null, retObject);
								} else {
									done (err3, null);
								}

							});
						}
					} else {
						done(err2, null);
					}
				});
			}

			if (data1.length <= 0) {

				console.log("length");

				// Add input
				if (userID && move) {
					userIdList.push(userID);
					movesList.push(move);
				}

				boardState = gamePlay.getCurrentBoardState(userIdList, movesList, rows, cols);
				if (!boardState) {
					done ("Invalid Move", null);
					return;
				}

				retObject["boardData"] = boardState;
				boardObj.getUsersOfBoard(board_name, function (err3, data3) {
					if (!err3 && data3) {

						console.log("getUsersOfBoard");
						console.log(data3);

						var userdata = [];
						for (var j = 0; j < data3.length; j++) {
							userdata.push({"userName": data3[j].username, "userIndex": data3[j].user_seq, "color": data3[j].colorid});
						}
						retObject["userData"] = userdata;

						done(null, retObject);
					} else {
						done(err3, null);
					}

				});
			}



		} else {
			done (err1, null);
		}
	});

}



