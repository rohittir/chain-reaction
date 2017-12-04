

// app/board.js

// DATABASE connection
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// Here, all the application interaction with databse is needed

module.exports = {

    //
    // GET METHODS
    //

    getColor: function (seq) {
        switch (seq) {
            case 1: return "blue";
            case 2: return "green";
            case 3: return "red";
            case 4: return "black";
        }

        return "white";
    },

    isUserPlayingOnBoard: function (username, done) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE username = ? AND board_status=\"ACTIVE\"";

        connection.query (command, [username], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, true);
            }
        });

    },

    getCurrActiveBoardOfUser: function (userName, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE username = ? AND board_status=\"ACTIVE\"";

        connection.query (command, [userName], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows);
            }
        });

    },

    getUserPoints: function (username, board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name= ? AND username = ?";

        connection.query (command, [board_name, username], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows[0].points);
            }
        });
    },

    getUserColor: function (username, board_name, done) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name= ? AND username = ?";

        connection.query (command, [board_name, username], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length) {
                done(null, rows[0].colorid);
            }
        });
    },

    getUserSequence: function (username, board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND username = ?";

        connection.query (command, [board_name, username], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows[0].user_seq);
            }
        });
    },

    getBoardStartTime: function (board_name, done) {

        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows[0].startTime);
            }
        });

    },

    getBoardEndTime: function (board_name, done) {
        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows[0].endTime);
            }
        });
    },

    getBoardStatus: function (board_name, done) {
        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows[0].status);
            }
        });
    },

    getAllMovesOfBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ? ORDER BY move_seq ASC";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows) {
                done(null, rows);
            }
        });

    },

    getNumberOfMovesOnBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows) {
                done(null, rows.length);
            }
        });
    },

    getLastMoveUserOnBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ? ORDER BY move_seq ASC";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows[rows.length-1].username);
            }
        });

    },

    getUsersOfBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows);
            }
        });
    },

    getNumUsersOnBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows) {
                done(null, rows.length);
            }
        });
    },

    getAllActiveBoards: function (done) {
        var command = "SELECT * FROM BOARD WHERE board_status = \"ACTIVE\"";

        connection.query (command, function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows);
            }
        });
    },

    getAllBoardsWaitingForPlayers: function (done) {
        var command = "SELECT * FROM BOARD WHERE board_status = \"WAITING\"";

        connection.query (command, function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows);
            }
        });
    },

    getBoardId: function (board_name, done) {

        var command = "SELECT * FROM BOARD WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            }

            if(rows && rows.length > 0) {
                done(null, rows[0].board_id);
            }
        });
    },

    //
    // SET/CREATE METHODS
    //

    createNewBoard: function (board_name, done) {

        var command = "INSERT INTO BOARD (board_name, board_status) VALUES (?, \"WAITING\")";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            } else {
                done(null, rows);
            }
        });
    },

    joinBoardPlay: function (boardName, username, done) {

        var _this = this;
        this.getBoardId(boardName, function(err, data) {
            if (!err) {
                var boardId = data;
                _this.getNumUsersOnBoard(boardName, function(err1, data1) {
                    if (!err1) {
                        var numUsers = data1;
                        var color = _this.getColor(numUsers+1);

                        var command = "INSERT INTO BOARD_PLAYERS (board_id, username, colorid, user_seq) VALUES (?, ?, ?, ?)";

                        connection.query (command, [boardId, username, color, numUsers+1], function(err3, rows) {
                            if (err3) {
                                done(err3, null);
                            } else {
                                done(null, rows);
                            }

                        });
                    } else {
                        done(err1, null);
                    }

                });
            } else {
                done(err, null);
            }

        });

    },

    startBoardPlay: function (board_name, done) {
        var _this = this;
        var command = "UPDATE BOARD SET startTime = (SELECT NOW()) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            } else {
                _this.setBoardStatus(board_name, "ACTIVE", function (err1, data1) {
                    if (!err1 && data1) {
                        done(null, rows);
                    } else {
                        done(err1, null);
                    }
                });
            }
        });
    },

    endBoardPlay: function (board_name, done) {

        var _this = this;
        var command = "UPDATE BOARD SET endTime = (SELECT NOW()) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                done(err, null);
            } else {
                _this.setBoardStatus(board_name, "COMPLETED", function (err1, data1) {
                    if (!err1 && data1) {
                        done(null, rows);
                    } else {
                        done(err1, null);
                    }
                });
            }
        });
    },

    setBoardStatus: function (board_name, boardStatus, done) {
        // boardStatus:= COMPLETED || WAITING || ACTIVE

        if (boardStatus != "COMPLETED" && boardStatus != "WAITING" && boardStatus != "ACTIVE") {
            done("Invalid status" , null);
        }

        var command = "UPDATE BOARD SET board_status = ? WHERE board_name = ?";

        connection.query (command, [boardStatus, board_name], function(err, rows) {
            if (err) {
                done(err, null);
            } else {
                done(null, rows);
            }
        });
    },

    addMoveToBoard: function (username, boardName, moveValue, done) {

        var _this = this;
       this.getBoardId(boardName, function (err1, data1) {
           if (!err1) {
                var boardId = data1;
                _this.getNumberOfMovesOnBoard(boardName, function(err2, data2) {
                    if (!err2) {
                        var numMoves = data2;
                        var command = "INSERT INTO PLAY_MOVE (board_id, username, move_seq, move_value) VALUES (?, ?, ?, ?)";
                        connection.query (command, [boardId, username, numMoves+1, moveValue], function(err, rows) {
                            if (err) {
                                done(err, null);
                            } else {
                                done(null, rows);
                            }
                        });

                    } else {
                        done(err2, null);
                    }
                });
           } else {
                done(err1, null);
           }

       });


    },

    updateUserPointsOnBoard: function (board_name, userName, pointsVa, done) {

        var _this = this;
        this.getBoardId(board_name, function (err1, data1) {

            if (!err1) {
                var boardId = data1;
                var command = "UPDATE BOARD_PLAYERS SET points = ? WHERE board_id = ? AND username = ?";
                connection.query (command, [pointsVal, boardId, userName], function(err, rows) {
                    if (err) {
                        done(err, null);
                    } else {
                        done(null, rows);
                    }
                });
            } else {
                done(err1, null);
            }
        });
    },

    setNextUserTurn: function(boardName, done) {

        var command = "SELECT * FROM (BOARD_PLAYERS JOIN BOARD) WHERE board_name = ?";
        connection.query (command, [boardName], function(err, rows) {
            console.log("Step 1");
            console.log(rows);

            if (err) {
                done(err, null);
            } else {
                console.log("Step 2");
                // console.log(rows);

                var lastTurnUserId = 0;
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i].isTurn == 1) {
                        lastTurnUserId = rows[i].user_seq;
                    }
                }
                console.log("Step 4");
                console.log(lastTurnUserId);

                var minUserIndex = 0;
                var maxUserIndex = 0;
                var nextUserIndex = 0;

                for (var i = 0; i < rows.length; i++) {
                    if (i == 0) {
                        minUserIndex = rows[i].user_seq;
                        maxUserIndex = rows[i].user_seq;
                        nextUserIndex = rows[i].user_seq;
                    } else {
                        if (minUserIndex > rows[i].user_seq) {
                            minUserIndex = rows[i].user_seq;
                        }

                        if (maxUserIndex < rows[i].user_seq) {
                            maxUserIndex = rows[i].user_seq;
                        }

                        if (lastTurnUserId < rows[i].user_seq && nextUserIndex > rows[i].user_seq) {
                            nextUserIndex = rows[i].user_seq;
                        }
                    }
                }

                console.log("Step 5");
                console.log(nextUserIndex);

                var finalUserTurnId = 0;
                if (lastTurnUserId == 0) {
                    finalUserTurnId = minUserIndex;
                } else {
                    if (lastTurnUserId == maxUserIndex) {
                        finalUserTurnId = minUserIndex;
                    } else {
                        finalUserTurnId = nextUserIndex;
                    }
                }
                console.log("Step 6");
                console.log(finalUserTurnId);

                if (finalUserTurnId != 0) {
                    var command1 = "UPDATE BOARD_PLAYERS SET isTurn = 1 WHERE board_id = ? AND user_seq = ?";
                    connection.query (command1, [rows[0].board_id, finalUserTurnId], function(err1, rows1) {

                        console.log("Step 7");
                        console.log(rows1);

                        if (err1) {
                            done(err1, null);
                        } else {
                            if (lastTurnUserId !== 0) {
                                var command2 = "UPDATE BOARD_PLAYERS SET isTurn = 0 WHERE board_id = ? AND user_seq = ?";
                                connection.query (command2, [rows[0].board_id, lastTurnUserId], function(err2, rows2) {
                                    console.log("Step 8");
                                    console.log(rows2);

                                    if (err2) {
                                        done(err2, null);
                                    } else {
                                        done(null, rows1);
                                    }
                                });
                            } else {
                                done(null, rows1);
                            }
                        }
                    });
                }
            }
        });


    },

    isUserTurn: function(userName, boardName, done) {

        var command = "SELECT * FROM (BOARD_PLAYERS JOIN BOARD) WHERE board_name = ? AND username = ?";

        connection.query (command, [boardName, userName], function(err, rows) {
            if (err) {
                done(err, null);
            } else {
                if (rows && rows.length > 0) {
                    if (rows[0].isTurn == 1) {
                        done(null, true);
                    } else {
                        done(null, false);
                    }
                }
            }
        });

    },

    isUserActive: function(userName, boardName, done) {

        var command = "SELECT * FROM (BOARD_PLAYERS JOIN BOARD) WHERE board_name = ? AND username = ?";

        connection.query (command, [boardName, userName], function(err, rows) {
            if (err) {
                done(err, null);
            } else {
                if (rows && rows.length > 0) {
                    if (rows[0].isActive == 1) {
                        done(null, true);
                    } else {
                        done(null, false);
                    }
                }
            }
        });

    },

    setUserInActive: function(userName, boardName, done) {

        var command = "SELECT * FROM (BOARD_PLAYERS JOIN BOARD) WHERE board_name = ? AND username = ?";

        connection.query (command, [boardName, userName], function(err, rows) {
            if (err) {
                done(err, null);
            } else {
                if (rows && rows.length > 0) {
                    if (rows[0].isActive == 1) {
                        var command1 = "UPDATE BOARD_PLAYERS SET isActive = 0 WHERE board_id = ? AND username = ?";

                        connection.query (command1, [rows[0].board_id, userName], function(err1, rows1) {
                            if (err1) {
                                done(err1, null);
                            } else if (rows1) {
                                done(null, rows1);
                            }
                        });

                    } else {
                        done(null, false);
                    }
                }
            }
        });

    },



};




