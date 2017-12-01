/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

// connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE IF NOT EXISTS`' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
        PRIMARY KEY (`username`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)');

connection.query('\
CREATE TABLE IF NOT EXISTS`' + dbconfig.database + '`.`BOARD` ( \
    `board_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `board_name` VARCHAR(20) NOT NULL, \
    `board_status` VARCHAR(10), \
    `startTime` DATETIME, \
    `endTime` DATETIME, \
        PRIMARY KEY (`board_id`), \
    UNIQUE INDEX `id_UNIQUE` (`board_id` ASC), \
    UNIQUE INDEX `board_name_UNIQUE` (`board_name` ASC) \
)');

connection.query('\
CREATE TABLE IF NOT EXISTS`' + dbconfig.database + '`.`BOARD_PLAYERS` ( \
    `board_id` INT UNSIGNED NOT NULL, \
    `username` VARCHAR(20) NOT NULL, \
    `points` INT UNSIGNED NOT NULL DEFAULT 0, \
    `colorid` VARCHAR(20) NOT NULL, \
    `user_seq` INT UNSIGNED NOT NULL DEFAULT 0, \
        PRIMARY KEY (`board_id`, `username`), \
        FOREIGN KEY (`board_id`) REFERENCES BOARD(`board_id`), \
        FOREIGN KEY (`username`) REFERENCES users(`username`) \
)');

connection.query('\
CREATE TABLE IF NOT EXISTS`' + dbconfig.database + '`.`PLAY_MOVE` ( \
    `board_id` INT UNSIGNED NOT NULL, \
    `username` VARCHAR(20) NOT NULL, \
    `move_seq` INT UNSIGNED NOT NULL, \
    `move_value` VARCHAR(20) NOT NULL, \
        PRIMARY KEY (`board_id`, `move_seq`), \
        FOREIGN KEY (`board_id`, `username`) REFERENCES BOARD_PLAYERS(`board_id`, `username`) \
)');

console.log('Success: Database Created!')

connection.end();
