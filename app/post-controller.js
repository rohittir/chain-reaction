/*
*
* SWE-681 programming project Fall-2017
* Author: Rohit Tirmanwar, Rohitaksh Vanaparthy
* File: app/post-controller.js
*/

// The purpose of this file is to connect between the user request and the application logic
// This file handles only the post requests from client

// Load the required files
var boardObj = require('./queries');
var gamePlay = require('./gameplay');
var utils = require('./controller-utils');



module.exports = {

    processCreateNewGameRequest: function(req, res) {
        boardObj.createNewBoard(req.body.gameTitle, function (err, data) {
            if (err) {
                res.status(500).send("Server Error: Board already exists");
            } else {
                // The username is already authenticated by the middleware
                var userName = req.user.username;
                // console.log(req.user);
                // console.log(userName);
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
    },

    processAddMoveRequest: function(req, res) {
        var moveValue = req.body.value;     // move vlaue has already been checked using regex rule
        var userName = req.user.username;   // The username is already authenticated by the middleware
        boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
            if (err) {
                // console.log(err);
                res.status(401).send("Error: User is not active in any game");
            } else {
                if (data && data.length >= 1) {
                    var board_name = data[0].board_name;

                    // Check if this user's turn
                    boardObj.isUserTurn(userName, board_name, function(err1, data1) {
                        if (!err1 && data1 == true) {
                            boardObj.getUserSequence(userName, board_name, function(err2, data2) {
                                if (err2) {
                                    // console.log(err);
                                    res.status(401).send("Error: User is not active in this board");
                                } else {
                                    let userId = data2;

                                    utils.getAllBoardData(board_name, userId, moveValue, function (err3, data3 ) {
                                        if (err3) {
                                            res.status(500).send("Error: Invalid move...");
                                        } else {
                                            // console.log(data3);

                                            // Add move to database
                                            boardObj.addMoveToBoard(userName, board_name, moveValue, function(err4, data4) {
                                                // console.log("addMoveToBoard");
                                                // console.log(data4);

                                                if (err4) {
                                                    res.status(500).send("Server Error: Internal error");
                                                } else {
                                                    boardObj.setNextUserTurn(board_name, function (err5, data5) {
                                                        // console.log("setNextUserTurn");
                                                        // console.log(data5);

                                                        if (err5) {
                                                            res.status(500).send("Server Error: Internal error");
                                                        } else {
                                                            // check if the game has finished...
                                                            utils.isGameFinished(board_name, data3.boardData, data3.cols, data3.rows, function (err7, data7, winner) {
                                                                if (err7) {
                                                                    res.status(500).send("Internal server error...");
                                                                } else {
                                                                    if (data7 == true) {
                                                                        if (!winner) {
                                                                            winner = utils.getWinnerFromPoints(data3.userData);
                                                                        }
                                                                        // End the game
                                                                        boardObj.endBoardPlay(board_name, winner, function(err9, data9){
                                                                            if (err9) {
                                                                                res.status(500).send("Internal server error...");
                                                                            } else {
                                                                                // data3["gameFinished"] = true;
                                                                                for (var i = 0; i < data3.userData.length; i++) {
                                                                                    if (data3.userData[i].userName == winner) {
                                                                                        data3.userData[i].winner = true;
                                                                                        break;
                                                                                    }
                                                                                }

                                                                                res.status(200).send(data3);
                                                                            }
                                                                        });

                                                                    } else {
                                                                        utils.checkForActiveUserHavingTurnInput(board_name);
                                                                        res.status(200).send(data3);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

                                            });
                                        }
                                    });

                                }

                            });

                        } else {
                            res.status(401).send("Error: It is not your turn...");
                        }
                    });

                }

            }

        });
    }


};