"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// I guess this is how you require in TypeScript (as opposed to... var inquirer = require("inquirer"); ...etc.)
var inquirer = require("inquirer");
var mysql = require("mysql");
var createDbConnection_1 = require("./createDbConnection");
var tableMaker_1 = require("./tableMaker");
var tableMaker_2 = require("./tableMaker");
// this is used to build out the main menu
var Choices = /** @class */ (function () {
    function Choices(id, name) {
        this.id = id;
        this.name = name;
    }
    return Choices;
}());
// this holds the items that constitute the main menu
var choices = [];
// oh heeyyyooooo it's a root password in plain text on a public GitHub
var connectionInfo = new createDbConnection_1.ConnectionInfo("localhost", 3306, "root", "8U#mDA345vUk5W6vtjVCSMStLUWHmD!u", "bamazon");
// all that work, and THIS is the payoff?!  As I said earlier, all this was for learning.
var connection = mysql.createConnection(connectionInfo);
// it does what it says.  connect to the database
var connectToDB = function () {
    connection.connect(function (err) {
        if (err)
            throw err;
    });
};
// disconnects from the database
var disconnectFromDB = function () {
    connection.end();
};
// this takes item ids and names from the db, packages them into objects, and pushes the object into the choices array
var pushToChoices = function (id, name) {
    choices.push(new Choices(id, name));
};
// draws the product table and then displays the main menu
var displayTableAndStart = function () {
    var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
    connection.query(query, function (err, res) {
        if (err)
            throw err;
        // populate the purchase menu
        for (var i = 0; i < res.length; i++) {
            pushToChoices(res[i].item_id, res[i].product_name);
        }
        // this draws the tables by using my own table-generating code (contained in tableMaker.ts)
        // make sure the number and order of the user-facing titles matches the MySQL query
        tableMaker_1.sendTitles(["ID", "PRODUCT", "PRICE", "IN STOCK"]);
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        tableMaker_2.makeTable(res);
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
            displayTableAndStart();
        }
        else {
            console.log("We hope to see you again soon!");
            disconnectFromDB();
        }
    });
};
// ------------------------------------------------------------------------------
connectToDB();
displayTableAndStart();
