// I guess this is how you require in TypeScript (as opposed to... var inquirer = require("inquirer"); ...etc.)
import inquirer = require("inquirer");
import mysql = require("mysql");
import { ConnectionInfo } from "./createDbConnection";
import { connectionInfo } from "./createDbConnection";
import { sendTitles } from "./tableMaker";
import { makeTable } from "./tableMaker";
import { printLogo } from "./bamazonLogo";

// this is used to build out the main menu
class Choices {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

// this holds the items that constitute the main menu
var choices: any[] = [];

// the database connection object (see createDbConnection.ts)
var connection = mysql.createConnection(connectionInfo);

// it does what it says.  connect to the database
var connectToDB = function(): void {
    connection.connect((err) => {
        if (err) throw err;
    })
}

// disconnects from the database
var disconnectFromDB = function(): void {
    connection.end();
}

// this takes item ids and names from the db, packages them into objects, and pushes the object into the choices array
var pushToChoices = function(id: number, name: string): void {
    choices.push(new Choices(id, name));
}

// draws the product table and then displays the main menu
var displayTable = function(query: string, buildMenu?: boolean): void {
    connection.query(query, function(err, res) {
        if (err) throw err;

        // populate the menu.  this is not used by some of the menu options, so let's short circuit it when appropriate
        // this if statement short circuits the for loop if buildMenu is false or undefined, saving us some computation!  woot
        if (buildMenu || false) {
            choices = [];
            for (var i: number = 0; i < res.length; i++) {
                pushToChoices(res[i].item_id, res[i].product_name);
            }
        }

        // this draws the tables by using my own table-generating code (contained in tableMaker.ts)
        // make sure the number and order of the user-facing titles matches the MySQL query
        sendTitles(["ID", "DEPARTMENT", "PRODUCT", "MFG/AUTHOR/ARTIST", "PRICE", "IN STOCK"]);
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        makeTable(res);
    })
}

var selectProductToUpdate = function(): void {
    inquirer
    .prompt([
        {
            type: "list",
            message: "Which product would you like to update?",
            choices: choices,
            name: "update"
        }
    ])
    .then(response => {
        updateProductQuantity(response.update)
    })
}

var updateProductQuantity = function(name: string): void {
    console.log(`You're updating ${name}.`);
    function checkForNum(qty: any): boolean | string {
        if (qty === "cancel" || qty === "quit") {
            return true;
        }
        else if (/^[0-9]/.test(qty)) {
            return true;
        }
        else {return "Please enter a number."}
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
    .then (response => {
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
    })
}

var addToInventory = function(name: string, qty: number): void {
    console.log(`Adding ${qty} to our stock of ${name}.`);
    displayTable(``);
    var query: string = `SET stock_quantity=stockquantity+${qty} FROM products WHERE ?`;
    connection.query(query, 
        {product_name: name},
        function(err, res) {

    })
}

var mainMenu = function(): void {
    inquirer
    .prompt([
        {
            type: "list",
            message: "Welcome, manager!  What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
            name: "manage"
        }
    ])
    .then((response) => {
        switch (response.manage) {
            case "View Products for Sale":
            displayTable("SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products");
            setTimeout(mainMenu,100);
            break;

            case "View Low Inventory":
            displayTable("SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products WHERE stock_quantity <= 5");
            setTimeout(mainMenu,100);
            break;

            case "Add to Inventory":
            displayTable("SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products", true);
            setTimeout(selectProductToUpdate,100);
            break;

            case "Add New Product":
            // code here
            break;

            case "Quit":
            disconnectFromDB();
            break;
        }
    })
}
// ------------------------------------------------------------------------------
printLogo();
setTimeout(mainMenu, 1000);