"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var ConnectionInfo = /** @class */ (function () {
    // just your plain old constructor
    function ConnectionInfo(host, port, user, password, database) {
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.database = database;
    }
    return ConnectionInfo;
}());
exports.ConnectionInfo = ConnectionInfo;
// EDIT HERE if your database credentials are different
exports.connectionInfo = new ConnectionInfo("localhost", 3306, "root", "8U#mDA345vUk5W6vtjVCSMStLUWHmD!u", "bamazon");
// the database connection object (see createDbConnection.ts)
exports.connection = mysql.createConnection(exports.connectionInfo);
// it does what it says.  connect to the database
exports.connectToDB = function () {
    exports.connection.connect(function (err) {
        if (err)
            throw err;
    });
};
// disconnects from the database
exports.disconnectFromDB = function () {
    exports.connection.end();
};
