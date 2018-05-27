"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var tableMaker_1 = require("./tableMaker");
var tableMaker_2 = require("./tableMaker");
var tableMaker_3 = require("./tableMaker");
// Since I don't expect to instantiate other objects of class ConnectionInfo, doing it this way is functionally pointless.
// I'm only doing it for the learning.
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
// oh heeyyyooooo it's a root password in plain text on a public GitHub
var connectionInfo = new ConnectionInfo("localhost", 3306, "root", "8U#mDA345vUk5W6vtjVCSMStLUWHmD!u", "bamazon");
// all that work, and THIS is the payoff?!  As I said earlier, all this was for learning.
var connection = mysql.createConnection(connectionInfo);
// it does what it says.  connect to the database
var connectToDB = function () {
    connection.connect(function (err) {
        if (err)
            throw err;
        console.log("connected as id " + connection.threadId + "\n");
    });
};
// disconnects from the database
var disconnectFromDB = function () {
    connection.end();
    console.log("disconnected from database.\n");
};
var drawTable = function () {
    connection.query("SELECT item_id, product_name, price FROM products", function (err, res) {
        if (err)
            throw err;
        // specifying that these vars are numbers is redundant because I know the function returns a number
        // and I ABSOLUTELY KNOW it returns a number because TypeScript gives me confidence!
        var idLength = tableMaker_1.getLengthOfLongestItem(res, "item_id");
        var productLength = tableMaker_1.getLengthOfLongestItem(res, "product_name");
        var priceLength = tableMaker_1.getLengthOfLongestItem(res, "price");
        var separator;
        var lenSeparator;
        var id = "ID" + tableMaker_2.generatePadding(idLength, "ID".length);
        var product = "PRODUCT" + tableMaker_2.generatePadding(productLength, "PRODUCT".length);
        var price = "PRICE" + tableMaker_2.generatePadding(priceLength, "PRICE".length);
        var header = "";
        // insert padding on the right-hand side for each entry
        for (var i = 0; i < res.length; i++) {
            res[i].item_id += tableMaker_2.generatePadding(idLength, res[i].item_id.toString().length);
            res[i].product_name += tableMaker_2.generatePadding(productLength, res[i].product_name.length);
            res[i].price += tableMaker_2.generatePadding(priceLength, res[i].price.toString().length);
        }
        // generate the separator based on the length of the first row (all rows are now the same length due to padding insertion)
        lenSeparator = ("| " + res[0].item_id + " | " + res[0].product_name + " | " + res[0].price + " |").length;
        separator = tableMaker_3.generateHorizontalSeparator(lenSeparator);
        // print out the table header
        console.log(separator);
        header = "| " + id + " | " + product + " | " + price + " |";
        console.log(header);
        // print out the rest of the table
        console.log(separator);
        for (var i = 0; i < res.length; i++) {
            var lineItem = "| " + res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " |";
            console.log(lineItem);
        }
        console.log(separator);
    });
};
// ------------------------------------------------------------------------------
connectToDB();
drawTable();
disconnectFromDB();
