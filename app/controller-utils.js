/*
*
* SWE-681 programming project Fall-2017
* Author: Rohit Tirmanwar, Rohitaksh Vanaparthy
* File: app/controller-utils.js
*/

// The purpose of this file is tocontain utility functions required for controllers

// Load the required files
var boardObj = require('./queries');
var gamePlay = require('./gameplay');


// Inital data
var lastUserHavingTurn = null;
var turnCheckTimeout = null;

module.exports = {

    getUsersMovesCount: function (usersList, boardName, done) {

        var userMovesList = [];
        for (var i = 0;i < usersList.length; i++) {
            boardObj.getNumberOfMovesOfUser(boardName, usersList[i].username, function(err, data) {

                if (err) {
                    done (err, null);
                } else {
                    userMovesList.push(data);

                    if (userMovesList.length >= usersList.length) {
                        done (null, userMovesList);
                    }
                }

            });
        }

    },

    getWinnerFromPoints: function (userData) {
        var maxPoints = 0;
        var winner = "";
        for (var i = 0; i < userData.length; i++) {
            if (maxPoints < userData[i].points) {
                maxPoints = userData[i].points;
                winner = userData[i].userName;
            }
        }

        return winner;
    },


    isGameFinished: function (boardName, boardState, cols, rows, done) {

        boardObj.getBoardStatus(boardName, function (error, dataset) {
            if (error) {
                done (error, null, null);
            } else {
                if (dataset == "ACTIVE") {
                    if (true == gamePlay.isBoardFullyOccupiedBySameUser(boardState, rows, cols)) {
                        var winner = gamePlay.getAnyOwnerOfCell(boardState, rows, cols);
                        done (null, true, winner)
                    } else {
                        boardObj.getMinNumMovesByAllUsersOnBoard(boardName, function(err, data) {
                            console.log("getMinNumMovesByAllUsersOnBoard");
                            console.log(data);
                            if (err) {
                                done (err, null, null);
                            } else {
                                if (data >= 50) {
                                    done (null, true, null);
                                } else {
                                    boardObj.getActiveUsersOnBoard(boardName, function (err2, data2) {
                                        if (err2) {
                                            done (err2, null, null);
                                        } else {
                                            console.log("getActiveUsersOnBoard");
                                            console.log(data2);
                                            if (data2 && data2.length <= 1) {
                                                done (null, true, data2[0].username);
                                            } else {
                                                done (null, false, null);
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                } else {
                    done (null, false, null);
                }
            }
        });

    },

    checkForActiveUserHavingTurnInput: function (boardName) {

        if (turnCheckTimeout) {
            clearTimeout(turnCheckTimeout);
        }

        boardObj.getUserHavingTurn(boardName, function(err, data) {
            if (err) {
                // error
                // done(err, null);
            } else {
                lastUserHavingTurn = data;
                turnCheckTimeout = setTimeout(isSameActiveUser, 15000, boardName);
                // done(null, data);
            }
        });


    },

    isSameActiveUser: function (boardName) {

        var _this = this;
        boardObj.getUserHavingTurn(boardName, function(err, data) {
            if (err) {
                //error
                // done(err, null);
            } else {
                if (lastUserHavingTurn == data) {
                    boardObj.addMoveToBoard(lastUserHavingTurn, boardName, "Timeout", function(err1, data1) {
                        if (err1) {
                            // Error
                        } else {
                            boardObj.setNextUserTurn(boardName, function(err2, data2) {
                                if (err2) {
                                    // Error
                                } else {
                                    boardObj.getNumLastConsecutiveTimeoutsOfUser(boardName, lastUserHavingTurn, function(err2, data2){
                                        if (!err2) {
                                            if (data2 >= 3) {
                                                // forfeit the game for this user
                                                boardObj.setUserInActive(lastUserHavingTurn, boardName, function (err3, data3) {
                                                    if (!err3) {
                                                        boardObj.addMoveToBoard(lastUserHavingTurn, boardName, "forfeited", function(err4, data4){
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    _this.checkForActiveUserHavingTurnInput();
                                }
                            });
                        }
                    });
                }
            }
        });
    },

    getUserGamePlayInfo: function (username, done) {
        boardObj.getUsersCompletedBoards(username, function(err, data) {
            if (err) {
                console.log(err);
                done (err, null);
            } else {
                var gamesData = [];
                if (data.length <= 0) {
                    done(null, gamesData);
                }
                var numBoardsprocessed = 0;
                for (var i = 0; i < data.length; i++) {
                    var currData = data[i];

                    gamesData.push({"user": username, "boardName": currData.board_name, "start": currData.startTime,
                    "end": currData.endTime, "color": currData.colorid, "forfeited": !currData.isActive, "winner": currData.winner, "moveSeq": null});

                    boardObj.getAllMovesOfBoard(currData.board_name, function(err1, data1) {
                        numBoardsprocessed++;
                        if (err1) {
                            done(err1, null);
                            console.log(err1);
                        } else {
                            var moveSeq = [];
                            for (var j = 0; j < data1.length; j++) {
                                moveSeq.push({"userName": data1[j].username, "moveCellId": data1[j].move_value});
                            }
                            for (var k = 0; k < gamesData.length; k++) {
                                if (data1.length > 0) {
                                    if (gamesData[k].boardName == data1[0].board_name) {
                                        gamesData[k].moveSeq = moveSeq;
                                    }
                                }
                            }
                        }

                        if(numBoardsprocessed >=  gamesData.length) {
                            done(null, gamesData);
                        }

                    });
                }
            }
        });
    }

};




