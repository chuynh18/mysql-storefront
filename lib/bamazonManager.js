"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// I guess this is how you require in TypeScript (as opposed to... var inquirer = require("inquirer"); ...etc.)
var inquirer = require("inquirer");
var mysql = require("mysql");
var createDbConnection_1 = require("./createDbConnection");
var tableMaker_1 = require("./tableMaker");
var tableMaker_2 = require("./tableMaker");
var bamazonLogo_1 = require("./bamazonLogo");
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
// the database connection object (see createDbConnection.ts)
var connection = mysql.createConnection(createDbConnection_1.connectionInfo);
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
var displayTable = function (query, buildMenu) {
    connection.query(query, function (err, res) {
        if (err)
            throw err;
        // populate the menu.  this is not used by some of the menu options, so let's short circuit it when appropriate
        // this if statement short circuits the for loop if buildMenu is false or undefined, saving us some computation!  woot
        if (buildMenu || false) {
            choices = [];
            for (var i = 0; i < res.length; i++) {
                pushToChoices(res[i].item_id, res[i].product_name);
            }
        }
        // this draws the tables by using my own table-generating code (contained in tableMaker.ts)
        // make sure the number and order of the user-facing titles matches the MySQL query
        tableMaker_1.sendTitles(["ID", "DEPARTMENT", "PRODUCT", "MFG/AUTHOR/ARTIST", "PRICE", "IN STOCK"]);
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        tableMaker_2.makeTable(res);
    });
};
var selectProductToUpdate = function () {
    inquirer
        .prompt([
        {
            type: "list",
            message: "Which product would you like to update?",
            choices: choices,
            name: "update"
        }
    ])
        .then(function (response) {
        updateProductQuantity(response.update);
    });
};
var updateProductQuantity = function (name) {
    console.log("You're updating " + name + ".");
    function checkForNum(qty) {
        if (qty === "cancel" || qty === "quit") {
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
            message: "How many would you like to add?  Or type \"cancel\" or \"0\" to go to the main menu or \"quit\" to leave.",
            name: "quantity",
            validate: checkForNum
        }
    ])
        .then(function (response) {
        if (response.quantity === "cancel" || response.quantity === "0") {
            mainMenu();
        }
        else if (response.quantity === "quit") {
            console.log("Logging you out.");
            disconnectFromDB();
        }
        else if (parseInt(response.quantity) > 0) {
            addToInventory(name, parseInt(response.quantity));
        }
        else if (parseInt(response.quantity) < 0) {
            console.log("Sorry, please enter a valid number.");
            updateProductQuantity(name);
        }
    });
};
var addToInventory = function (name, qty) {
    console.log("Adding " + qty + " to our stock of " + name + ".");
    var query = "SET stock_quantity=stockquantity+" + qty + " FROM products WHERE ?";
    connection.query(query, { product_name: name }, function (err, res) {
    });
};
var mainMenu = function () {
    inquirer
        .prompt([
        {
            type: "list",
            message: "Welcome, manager!  What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
            name: "manage"
        }
    ])
        .then(function (response) {
        switch (response.manage) {
            case "View Products for Sale":
                displayTable("SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products");
                setTimeout(mainMenu, 100);
                break;
            case "View Low Inventory":
                displayTable("SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products WHERE stock_quantity <= 5");
                setTimeout(mainMenu, 100);
                break;
            case "Add to Inventory":
                displayTable("SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products", true);
                setTimeout(selectProductToUpdate, 100);
                break;
            case "Add New Product":
                // code here
                break;
            case "Quit":
                disconnectFromDB();
                break;
        }
    });
};
// ------------------------------------------------------------------------------
bamazonLogo_1.printLogo();
setTimeout(mainMenu, 1000);