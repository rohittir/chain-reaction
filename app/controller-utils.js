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
        var isTie = false;
        var winner = [""];
        for (var i = 0; i < userData.length; i++) {
            if (maxPoints < userData[i].points) {
                maxPoints = userData[i].points;
                winner[0] = userData[i].userName;
            }
        }

        if (winner[0] != "") {
            for (var i = 0; i < userData.length; i++) {
                if (maxPoints == userData[i].points && winner[0] != userData[i].userName) {
                    isTie = true;
                    winner.push(userData[i].userName);
                    break;
                }
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
                                                if (data2.length == 1) {
                                                    done (null, true, data2[0].username);
                                                } else if (data2.length < 1) {
                                                    done (null, true, "Game Abandoned by all users");
                                                }
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

        var _this = this;

        boardObj.getUserHavingTurn(boardName, function(err, data) {
            if (err) {
                // error
                // done(err, null);
            } else {
                lastUserHavingTurn = data;
                turnCheckTimeout = setTimeout(_this.isSameActiveUser, 15000, boardName);
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
                                    if(typeof _this.checkForActiveUserHavingTurnInput === "function") {
                                        _this.checkForActiveUserHavingTurnInput();
                                    }
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
    },



    // getBoardStatus: function (boardName, userName, done) {
    //     if (boardName && userName) {
    //         boardObj.getUserBoardStatus(boardName, userName, function (err, data) {
    //             if (err) {
    //                 done (err, null)
    //             } else if (data) {
    //                 done (null, data);
    //             }
    //         });
    //     }

    // },

    // getUserTurnName: function (boardName, done) {
    //     if (boardName) {
    //         boardObj.getUserHavingTurn(boardName, function (err, data) {
    //             if (err) {
    //                 done (err, null);
    //             } else {
    //                 done (null, data);
    //             }
    //         });
    //     }
    // },

    getAllBoardData: function (board_name, userID, move, done) {

        var retObject = {};
        var rows = 6;
        var cols = 6;
        retObject["boardName"] = board_name;
        retObject["rows"] = rows;
        retObject["cols"] = cols;
        retObject["boardData"] = null;
        retObject["userData"] = null;
        // retObject["gameFinished"] = null;

        var _this = this;

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

                                        _this.getUsersMovesCount(data3, board_name, function (err5, data5) {
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

                            _this.getUsersMovesCount(data3, board_name, function (err5, data5) {
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

    },


};




