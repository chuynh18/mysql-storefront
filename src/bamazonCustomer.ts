// I guess this is how you do it in TypeScript (as opposed to... var inquirer = require("inquirer"); ...etc.)
import inquirer = require("inquirer");
import mysql = require("mysql");

// Since I don't expect to create other objects of class ConnectionInfo, doing it this way is rather pointless.
// I'm only doing it for learning.
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

var connectionInfo = new ConnectionInfo("localhost", 3306, "root", "8U#mDA345vUk5W6vtjVCSMStLUWHmD!u", "bamazon");

// all that work, and THIS is the payoff?!
var connection = mysql.createConnection(connectionInfo);

var connectToDB = function(): void {
    connection.connect((err) => {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");
    })
}

var disconnectFromDB = function(): void {
    connection.end();
    console.log("disconnected from database.\n");
}

var dumpTableContents = function(): void {
    connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
        if (err) throw err;
        // console.log(res);
        var idLength: number = getLengthOfLongestItem(res, "item_id");
        var productLength: number = getLengthOfLongestItem(res, "product_name");
        var priceLength: number = getLengthOfLongestItem(res, "price");
        // console.log("idLength: " + idLength);
        // console.log("productLength: " + productLength);
        // console.log("priceLength: " + priceLength);

        

      });
}

// functionality for pretty printing text tables in the terminal:
// fundamentally, what a text table is... is making it so each item in a column has the same length
// so we need to get the length of the longest item in a column, then pad every item with a shorter length the appropriate amount
var getLengthOfLongestItem = function(response: object[], col: string | number): number {
    var currentLongest: number = 0;
    for (var i: number = 0; i < response.length; i++) {
        if (response[i][col].toString().length > currentLongest) {
            currentLongest = response[i][col].toString().length;
        }
    }
    return currentLongest;
}

// then we need to generate the right number of spaces for everything shorter than the longest item
// this is the difference between the length of the longest string and the current string we're considering
var generatePadding = function(lenOfLongest: number, lenOfCurrent: number): string {
    var space: string = "";
    var difference: number = lenOfLongest - lenOfCurrent;
    for (var i: number = 0; i < difference; i++) {
        space += " ";
    }
    return space;
}

// ------------------------------------------------------------------------------

connectToDB();
dumpTableContents();
disconnectFromDB();