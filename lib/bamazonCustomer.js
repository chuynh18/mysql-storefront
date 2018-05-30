"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// I guess this is how you require in TypeScript (as opposed to... var inquirer = require("inquirer"); ...etc.)
var inquirer = require("inquirer");
var createDbConnection_1 = require("./createDbConnection"); // provides mysql npm package + connects to db
var createDbConnection_2 = require("./createDbConnection");
var createDbConnection_3 = require("./createDbConnection");
var tableMaker_1 = require("./tableMaker"); // creates tables
var tableMaker_2 = require("./tableMaker");
var bamazonLogo_1 = require("./bamazonLogo"); // prints bamazon logo
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
// this takes item ids and names from the db, packages them into objects, and pushes the object into the choices array
var pushToChoices = function (id, name) {
    choices.push(new Choices(id, name));
};
// draws the product table and then displays the main menu
var displayTableAndStart = function () {
    var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
    bamazonLogo_1.printLogo();
    createDbConnection_1.connection.query(query, function (err, res) {
        if (err)
            throw err;
        // populate the purchase menu
        choices = [];
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
        createDbConnection_1.connection.query(query, { item_id: itemId }, function (err, res) {
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
        else if (qty === "cancel" || qty === "quit") {
            return true;
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
            message: "How many would you like to purchase?  Or type \"cancel\" to go to the main menu or \"quit\" to leave.",
            name: "quantity",
            validate: checkForNum
        }
    ])
        .then(function (response) {
        var query = "SELECT stock_quantity FROM products WHERE ?";
        createDbConnection_1.connection.query(query, { item_id: itemId }, function (err, res) {
            if (response.quantity === "cancel") {
                displayTableAndStart();
            }
            else if (response.quantity === "quit") {
                console.log("We hope to see you again soon!");
                createDbConnection_3.disconnectFromDB();
            }
            else if (parseInt(response.quantity) < 0) {
                console.log("Sorry, please enter a valid number.");
                quantityMenu(item, itemId);
            }
            else if (parseInt(response.quantity) > res[0].stock_quantity) {
                console.log("One moment please.  I'm checking to see if I can purchase " + parseInt(response.quantity) + " of " + item + " for you.");
                console.log("Sorry, we don't have that many in stock.  Please try ordering fewer.");
                quantityMenu(item, itemId);
            }
            else if (parseInt(response.quantity) <= res[0].stock_quantity) {
                console.log("One moment please.  I'm checking to see if I can purchase " + parseInt(response.quantity) + " of " + item + " for you.");
                purchaseConfirmation(item, itemId, parseInt(response.quantity), res[0].stock_quantity);
            }
            else {
                console.log("Sorry, please enter a valid number.");
                quantityMenu(item, itemId);
            }
        });
    });
};
var purchaseConfirmation = function (item, itemId, qty, inStock) {
    var query = "SELECT price FROM products WHERE ?";
    var total;
    var price;
    createDbConnection_1.connection.query(query, { item_id: itemId }, function (err, res) {
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
                updateDB(itemId, qty, inStock, parseFloat(total));
            }
            else {
                console.log("Not a problem!  Your purchase has been canceled.");
                continueShopping();
            }
        });
    });
};
var updateDB = function (itemId, qty, inStock, total) {
    createDbConnection_1.connection.query("UPDATE products SET product_sales = product_sales+" + total + " WHERE ?", { item_id: itemId }, function (err, res) {
        var newValue = inStock - qty;
        var query = "UPDATE products SET stock_quantity = " + newValue + " WHERE ?";
        createDbConnection_1.connection.query(query, { item_id: itemId }, function (err, res) {
            console.log("Your purchase was made successfully!  Thank you for shopping with us.");
            continueShopping();
        });
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
            createDbConnection_3.disconnectFromDB();
        }
    });
};
// ------------------------------------------------------------------------------
createDbConnection_2.connectToDB();
displayTableAndStart();
