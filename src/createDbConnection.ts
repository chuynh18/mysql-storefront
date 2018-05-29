export class ConnectionInfo {
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
export var connectionInfo = new ConnectionInfo("localhost", 3306, "root", "8U#mDA345vUk5W6vtjVCSMStLUWHmD!u", "bamazon");