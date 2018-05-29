// createDbConnection is now responsible for MySQL stuff; bamazonCustomer et al. no longer require the mysql npm package
import mysql = require("mysql");

class ConnectionInfo {
    // class definition
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;

    // just your plain old constructor
    constructor(host: string, port: number, user: string, password: string, database: string) {
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.database = database;
    }
}

// EDIT HERE if your database credentials are different
var connectionInfo = new ConnectionInfo("localhost", 3306, "root", "8U#mDA345vUk5W6vtjVCSMStLUWHmD!u", "bamazon");

// the database connection object (see createDbConnection.ts)
export var connection = mysql.createConnection(connectionInfo);

// it does what it says.  connect to the database
export var connectToDB = function(): void {
    connection.connect((err) => {
        if (err) throw err;
    })
}

// disconnects from the database
export var disconnectFromDB = function(): void {
    connection.end();
}