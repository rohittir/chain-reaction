
/*
*
* SWE-681 programming project Fall-2017
* Author: Rohit Tirmanwar, Rohitaksh Vanaparthy
* File: app/controller.js
*/

// The purpose of this file is to connect between the user request and the application logic

// Load the required files
var boardObj = require('./queries');
var gamePlay = require('./gameplay');
var utils = require('./controller-utils');

module.exports = {

    processUserProfileRequest :function(req, res) {
        // check the user role
        boardObj.getUserRole(req.user.username, function(err, data) {
            if (!err) {
                boardObj.getAllUsers(function(err4, data4) {
                    if (err4) {
                        res.status(500).send("Server error...");
                    } else {
                        var usersList = [req.user.username];
                        var gameData = [];
                        if (data == "ADMIN") {
                            usersList = [];
                            for (var k = 0; k < data4.length; k++) {
                                usersList.push(data4[k].username);
                            }
                        }
                        var count = 0;
                        for(var i = 0; i < usersList.length; i++) {
                            utils.getUserGamePlayInfo (usersList[i], function(err2, data2) {
                                count++

                                if(!err2) {
                                    gameData = gameData.concat(data2);
                                }
                                if (count == usersList.length) {
                                    res.status(200).send(gameData);
                                }
                            });
                        }
                    }
                });

            } else {
                res.status(401).send("Invalid user...");
            }
        });
    },


    processExistingGamesRequest: function(req, res) {
        // Access the database for active games
        boardObj.getAllBoardsWaitingForPlayers( function (err, data) {
            if (err) {
                res.status(500).send("Error: Server invalid board error");
            } else {
                // console.log(data);
                res.status(200).send(data);
            }
        });
    },

    processJoinExistingGameRequest: function (req, res) {
        // Access the database
        var userName = req.user.username;
        // console.log(userName);
        boardObj.joinBoardPlay(req.query.gameTitle, userName, function (err, data) {
            if (err) {
                // res.status(500).send("Error: User already Joined");
                // res.redirect('/board');
                res.status(200).send("Joined the game successfully");
            } else {
                // console.log(data);
                res.status(200).send("Joined the game successfully");
                // res.redirect('/board');
            }
        });
    },

    checkIfUserIsCurrentlyPlayingGame: function (req, res)  {
        var userName = req.user.username;
        boardObj.isUserPlayingOnBoard(userName, function(err, data) {
            if (!err) {
                res.status(200).send(data);
            } else {
                res.status(500).send("Internal server error");
            }
        });
    },

    processUserPlayingGameRequest: function(req, res) {
        var userName = req.user.username;
        boardObj.getWaitingOrActiveBoardOfUser(userName, function (err, data) {
            if (err) {
                // console.log(err);
                res.status(500).send("Server Error: User is not active in any game");
                // res.redirect('/launch');
            } else {
                console.log(data);
                if (data && data.length >= 1) {
                    var board_name = data[0].board_name;
                    utils.getAllBoardData(board_name, null, null, function (err1, data1) {
                        console.log(err1);
                        console.log(data1);
                        if (err1) {
                            res.status(500).send("Server Error: Invalid board");
                        } else {
                            console.log(data1);
                            // check if the game has finished...
                            utils.isGameFinished(board_name, data1.boardData, data1.cols, data1.rows, function (err2, data2, winner) {
                                if (err2) {
                                    res.status(500).send("Server Error: Internal error");
                                } else {
                                    console.log("isGameFinished");
                                    console.log(data2);
                                    if (data2 == true) {
                                        if (!winner) {
                                            winner = utils.getWinnerFromPoints(data1.userData);
                                        }
                                        boardObj.endBoardPlay(board_name, winner, function(err9, data9) {
                                            if (err9) {
                                                res.status(500).send("Server Error: Internal error");
                                            } else {
                                                data1["gameFinished"] = true;
                                                for (var i = 0; i < data1.userData.length; i++) {
                                                    if (data1.userData[i].userName == winner) {
                                                        data1.userData[i].winner = true;
                                                        break;
                                                    }
                                                }
                                                res.status(200).send(data1);
                                            }
                                        });
                                    } else {
                                        res.status(200).send(data1);
                                    }
                                }
                            });
                        }
                    });

                }
            }
        });
    },

    processIsMyTurnRequest: function(req, res) {
        var userName = req.user.username;
        boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
            if (err) {
                // console.log(err);
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
    },

    processStartGameRequest: function(req, res) {
        var userName = req.user.username;
        boardObj.getCurrWaitingBoardOfUser(userName, function (err, data) {
            // console.log("getCurrActiveBoardOfUser");
            // console.log(data);

            if (err) {
                // console.log(err);
                res.status(401).send("Error: User is not active in any game");
            } else {

                if (data && data.length >= 1) {
                    var board_name = data[0].board_name;

                    boardObj.getNumUsersOnBoard(board_name, function(err2, data2) {
                        if (data2 >= 2 && !err2) {
                            // console.log("getNumUsersOnBoard");
                            // console.log(data2);

                            boardObj.startBoardPlay(board_name, function(err3, data3) {
                                if (!err3 && data3) {
                                    // console.log("startBoardPlay");
                                    // console.log(data3);

                                    // success
                                    boardObj.setNextUserTurn(board_name, function (err5, data5) {
                                        // console.log("setNextUserTurn");
                                        // console.log(data5);

                                        if (err5) {
                                            res.status(500).send("Server Error: Internal error");
                                            // console.log("Internal error while updating the next tuser's urn");
                                        } else {
                                            utils.checkForActiveUserHavingTurnInput(board_name);
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
    },

    forfeitGameRequest: function(req, res) {
        var userName = req.user.username;
        boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
            // console.log("getCurrActiveBoardOfUser");
            // console.log(data);

            if (err) {
                // console.log(err);
                res.status(401).send("Error: User is not active in any game");
            } else {
                if (data && data.length >= 1) {
                    var board_name = data[0].board_name;
                    boardObj.setUserInActive(userName, board_name, function (err1, data1) {
                        // console.log(err1);
                        // console.log(data1);
                        if (!err1) {
                            boardObj.addMoveToBoard(userName, board_name, "forfeited", function(err2, data2){
                                if (err2) {
                                    res.status(500).send("Error: Server internal error");
                                } else {
                                    res.status(200).send("User forfeited...");
                                }
                            });

                        } else {
                            res.status(401).send("Error: Server internal error");
                        }
                    });
                }
            }
        });
    },



};


function getBoardStatus(boardName, userName, done) {
	if (boardName && userName) {
		boardObj.getUserBoardStatus(boardName, userName, function (err, data) {
			if (err) {
				done (err, null)
			} else if (data) {
				done (null, data);
			}
		});
	}

}

function getUserTurnName(boardName, done) {
	if (boardName) {
		boardObj.getUserHavingTurn(boardName, function (err, data) {
			if (err) {
				done (err, null);
			} else {
				done (null, data);
			}
		});
	}
}

function getAllBoardData(board_name, userID, move, done) {

	var retObject = {};
	var rows = 6;
	var cols = 6;
	retObject["boardName"] = board_name;
	retObject["rows"] = rows;
	retObject["cols"] = cols;
	retObject["boardData"] = null;
	retObject["userData"] = null;
	retObject["gameFinished"] = null;

	boardObj.getAllMovesOfBoard(board_name, function(err1, data1) {
		if (!err1 && data1) {
			// console.log("getAllMovesOfBoard");
			// console.log(data1);

			var movesList = [];
			var userIdList = [];
			var boardState = null;
			for (var i = 0; i < data1.length; i++) {
				movesList.push(data1[i].move_value);
				// userIdList.push(0);
				boardObj.getUserSequence(data1[i].username, board_name, function(err2, data2) {
					if (!err2 && data2) {

						// console.log("getUserSequence");
						// console.log(data2);

						userIdList.push(data2);
						// console.log(userIdList);
						// console.log(i);
						// console.log(data1.length);

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

									utils.getUsersMovesCount(data3, board_name, function (err5, data5) {
										// console.log(data5);
										if (err5) {
											done (err5, null);
										} else {
											var userdata = [];
											for (var j = 0; j < data3.length; j++) {
												userdata.push({
													"userName": data3[j].username,
													"userIndex": data3[j].user_seq,
													"color": data3[j].colorid,
													"points": gamePlay.getUserPoints(data3[j].user_seq, boardState, rows, cols),
													"winner": false,
													"numMoves": (50-data5[j])
												});
											}
											retObject["userData"] = userdata;

											done(null, retObject);
										}
									});

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

				// console.log("length");

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

						// console.log("getUsersOfBoard");
						// console.log(data3);

						utils.getUsersMovesCount(data3, board_name, function (err5, data5) {
							if (err5) {
								done (err5, null);
							} else {
								var userdata = [];
								for (var j = 0; j < data3.length; j++) {
									userdata.push({
										"userName": data3[j].username,
										"userIndex": data3[j].user_seq,
										"color": data3[j].colorid,
										"points": gamePlay.getUserPoints(data3[j].user_seq, boardState, rows, cols),
										"winner": false,
										"numMoves": (50-data5[j])
									});
								}
								retObject["userData"] = userdata;

								done(null, retObject);
							}
						});
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
