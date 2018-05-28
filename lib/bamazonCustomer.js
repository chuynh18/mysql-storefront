"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// I guess this is how you require in TypeScript (as opposed to... var inquirer = require("inquirer"); ...etc.)
var inquirer = require("inquirer");
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
var Choices = /** @class */ (function () {
    function Choices(id, name) {
        this.id = id;
        this.name = name;
    }
    return Choices;
}());
var choices = [];
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
var pushToChoices = function (id, name) {
    choices.push(new Choices(id, name));
};
// I'm not happy that I've only managed to partially pull out some of the table functionality.
// A lot of heavy lifting is still done inside the main program.
var drawTable = function () {
    var query = "SELECT item_id, product_name, price FROM products";
    connection.query(query, function (err, res) {
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
            pushToChoices(res[i].item_id, res[i].product_name);
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
        setTimeout(mainMenu, 200);
    });
};
var mainMenu = function () {
    inquirer
        .prompt([
        {
            type: "list",
            message: "Which item would you like to purchase today?",
            choices: choices,
            name: "purchase"
        }
    ])
        .then(function (response) {
        var itemId;
        var query = "SELECT stock_quantity FROM products WHERE ?";
        for (var i = 0; i < choices.length; i++) {
            if (response.purchase === choices[i].name) {
                itemId = choices[i].id;
            }
        }
        connection.query(query, { item_id: itemId }, function (err, res) {
            if (res[0].stock_quantity === 0) {
                console.log("\nSorry, this item isn't currently in stock.  Please order something else.\n");
                mainMenu();
            }
            else {
                quantityMenu(response.purchase, itemId);
            }
        });
    });
};
var quantityMenu = function (item, itemId) {
    function checkForNum(qty) {
        if (parseInt(qty) === 0) {
            return ("Please purchase more than 0 items.  Besides, what does purchasing 0 items even mean?");
        }
        else if (/^[0-9]/.test(qty)) {
            return true;
        }
        else {
            return "Please enter a number.";
        }
    }
    inquirer
        .prompt([
        {
            type: "input",
            message: "How many would you like to purchase?",
            name: "quantity",
            validate: checkForNum
        }
    ])
        .then(function (response) {
        var query = "SELECT stock_quantity FROM products WHERE ?";
        console.log("One moment please.  I'm checking to see if I can purchase " + response.quantity + " of " + item + " for you.");
        connection.query(query, { item_id: itemId }, function (err, res) {
            if (response.quantity > res[0].stock_quantity) {
                console.log("Sorry, we don't have that many in stock.  Please try ordering fewer.");
                quantityMenu(item, itemId);
            }
            else {
                purchaseConfirmation(item, itemId, response.quantity, res[0].stock_quantity);
            }
        });
    });
};
var purchaseConfirmation = function (item, itemId, qty, inStock) {
    var query = "SELECT price FROM products WHERE ?";
    var total;
    var price;
    connection.query(query, { item_id: itemId }, function (err, res) {
        price = res[0].price;
        total = (qty * price).toFixed(2);
        console.log("Your purchase for " + qty + " of " + item + " will amount to $" + total + ".");
        inquirer
            .prompt([
            {
                type: "confirm",
                message: "Would you like to finalize this purchase?",
                name: "confirm",
                default: true
            }
        ])
            .then(function (answer) {
            if (answer.confirm) {
                updateDB(itemId, qty, inStock);
            }
            else {
                console.log("Not a problem!  Your purchase has been canceled.");
                continueShopping();
            }
        });
    });
};
var updateDB = function (itemId, qty, inStock) {
    var newValue = inStock - qty;
    var query = "UPDATE products SET stock_quantity = " + newValue + " WHERE ?";
    connection.query(query, { item_id: itemId }, function (err, res) {
        console.log("Your purchase was made successfully!  Thank you for shopping with us.");
        continueShopping();
    });
};
var continueShopping = function () {
    inquirer
        .prompt([
        {
            type: "confirm",
            message: "Would you like to continue shopping?",
            name: "confirm",
            default: true
        }
    ])
        .then(function (response) {
        if (response.confirm) {
            drawTable();
            mainMenu();
        }
        else {
            console.log("We hope to see you again soon!");
            disconnectFromDB();
        }
    });
};
// ------------------------------------------------------------------------------
connectToDB();
drawTable();
