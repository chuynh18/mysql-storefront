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