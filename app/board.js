

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

    isUserPlayingOnBoard: function (username, board_name) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name= ? AND username = ? AND status=\"ACTIVE\"";

        connection.query (command, [board_name], [username], function(err, rows) {
            if (err) {
                return false;
            }

            if(rows && rows.length > 0) {
                return true;
            }
        });

        return false;

    },

    getUserPoints: function (username, board_name) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name= ? AND username = ?";

        connection.query (command, [board_name], [username], function(err, rows) {
            if (err) {
                return 0;
            }

            if(rows && rows.length > 0) {
                return rows[0].points;
            }
        });

        return 0;
    },

    getUserColor: function (username, board_name) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name= ? AND username = ?";

        connection.query (command, [board_name], [username], function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length) {
                return rows[0].colorid;
            }
        });

        return null;
    },

    getUserSequence: function (username, board_name) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND username = ?";

        connection.query (command, [board_name], [username], function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length > 0) {
                return rows[0].user_seq;
            }
        });

        return null;
    },

    getBoardStartTime: function (board_name) {

        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length > 0) {
                return rows[0].startTime;
            }
        });

    },

    getBoardEndTime: function (board_name) {
        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length > 0) {
                return rows[0].endTime;
            }
        });

        return null;
    },

    getBoardStatus: function (board_name) {
        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length > 0) {
                return rows[0].status;
            }
        });

        return null;
    },

    getAllMovesOfBoard: function (board_name) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ? ORDER BY move_seq ASC";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length > 0) {
                return rows;
            }
        });

        return null;
    },

    getNumberOfMovesOnBoard: function (board_name) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return 0;
            }

            if(rows) {
                return rows.length;
            }
        });

        return 0;
    },

    getLastMoveUserOnBoard: function (board_name) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ? ORDER BY move_seq ASC";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length > 0) {
                return rows[rows.length-1].username;
            }
        });

        return null

    },

    getNumUsersOnBoard: function (board_name) {
        var command = "SELECT * FROM BOARD WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return 0;
            }

            if(rows) {
                return rows.length;
            }
        });

        return 0;


    },

    getAllActiveBoards: function () {
        var command = "SELECT * FROM BOARD WHERE board_status = \"ACTIVE\"";

        connection.query (command, function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length > 0) {
                return rows;
            }
        });

        return null
    },

    getBoardId: function (board_name) {

        var command = "SELECT * FROM BOARD WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return null;
            }

            if(rows && rows.length > 0) {
                return rows[0].board_id;
            }
        });

        return null;
    },

    //
    // SET/CREATE METHODS
    //

    createNewBoard: function (board_name) {

        var command = "INSERT INTO BOARD (board_name, board_status) VALUES (?, \"WAITING\")";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err);
                return null;
            }
            console.log(rows);
            return rows;
        });
    },

    joinBoardPlay: function (boardName, username) {

        var boardId = this.getBoardId(boardName);
        var numUsers = this.getNumUsersOnBoard(boardName);
        var color = this.getColor(numUsers+1);

        var command = "INSERT INTO BOARD_PLAYERS (board_id, username, colorid, user_seq) VALUES (?, ?, ?, ?)";

        connection.query (command, [boardId, username, color, numUsers+1], function(err, rows) {
            if (err) {
                return null;
            }

            return rows;
        });


    },

    startBoardPlay: function (board_name) {

        var command = "UPDATE BOARD SET startTime = (SELECT NOW()) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return null;
            }

            return rows;
        });
    },

    endBoardPlay: function (board_name) {
        var command = "UPDATE BOARD SET endTime = (SELECT NOW()) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                return null;
            }

            return rows;
        });
    },

    addMoveToBoard: function (username, boardName, moveValue) {
        var boardId = this.getBoardId(boardName);
        var numMoves = this.getNumberOfMovesOnBoard(boardName);

        var command = "INSERT INTO PLAY_MOVE (board_id, username, move_seq, move_value) VALUES (?, ?, ?, ?)";

        connection.query (command, [boardId, username, numMoves+1, moveValue], function(err, rows) {
            if (err) {
                return null;
            }

            return rows;
        });


    },

    updateUserPointsOnBoard: function (board_name, userName, pointsVal) {

        var boardId = this.getBoardId(board_name);

        var command = "UPDATE BOARD_PLAYERS SET points = ? WHERE board_id = ? AND username = ?";

        connection.query (command, [pointsVal, boardId, userName], function(err, rows) {
            if (err) {
                return null;
            }

            return rows;
        });

    }


};




