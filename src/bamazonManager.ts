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
var displayTable = function(): void {
    var query: string = "SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products";

    connection.query(query, function(err, res) {
        if (err) throw err;

        // populate the purchase menu
        for (var i: number = 0; i < res.length; i++) {
            pushToChoices(res[i].item_id, res[i].product_name);
        }

        // this draws the tables by using my own table-generating code (contained in tableMaker.ts)
        // make sure the number and order of the user-facing titles matches the MySQL query
        sendTitles(["ID", "DEPARTMENT", "PRODUCT", "MFG/AUTHOR/ARTIST", "PRICE", "IN STOCK"]);
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        makeTable(res);

        setTimeout(mainMenu,200);
    })
}

var mainMenu = function(): void {
    printLogo();

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
            displayTable();
            break;

            case "View Low Inventory":
            // code here
            break;

            case "Add to Inventory":
            // code here
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
mainMenu();