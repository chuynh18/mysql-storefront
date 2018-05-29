// I guess this is how you require in TypeScript (as opposed to... var inquirer = require("inquirer"); ...etc.)
import inquirer = require("inquirer");
import { connection } from "./createDbConnection";
import { connectToDB } from "./createDbConnection";
import { disconnectFromDB } from "./createDbConnection";
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

// this takes item ids and names from the db, packages them into objects, and pushes the object into the choices array
var pushToChoices = function(id: number, name: string): void {
    choices.push(new Choices(id, name));
}

// draws the product table and then displays the main menu
var displayTableAndStart = function(): void {
    var query: string = "SELECT item_id, product_name, price, stock_quantity FROM products";
    printLogo();
    
    connection.query(query, function(err, res) {
        if (err) throw err;

        // populate the purchase menu
        choices = [];
        for (var i: number = 0; i < res.length; i++) {
            pushToChoices(res[i].item_id, res[i].product_name);
        }


        // this draws the tables by using my own table-generating code (contained in tableMaker.ts)
        // make sure the number and order of the user-facing titles matches the MySQL query
        sendTitles(["ID", "PRODUCT", "PRICE", "IN STOCK"]);
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        makeTable(res);

        setTimeout(mainMenu, 200);
    })
}

var mainMenu = function(): void {
    inquirer
    .prompt([
        {
            type: "list",
            message: "Which item would you like to purchase today?",
            choices: choices,
            name: "purchase"
        }
    ])
    .then((response) => {
        var itemId: number;
        var query: string = "SELECT stock_quantity FROM products WHERE ?";
        for (var i: number = 0; i < choices.length; i++) {
            if (response.purchase === choices[i].name) {
                itemId = choices[i].id;
            }
        }
        connection.query(query, 
            {item_id: itemId},
            function(err, res) {
            if (res[0].stock_quantity === 0) {
                console.log("\nSorry, this item isn't currently in stock.  Please order something else.\n");
                mainMenu();
            }
            else {
                quantityMenu(response.purchase, itemId);
            }
        })
    })
}

var quantityMenu = function(item: string, itemId: number): void {
    function checkForNum(qty: any): boolean | string {
        if (parseInt(qty) === 0) {
            return ("Please purchase more than 0 items.  Besides, what does purchasing 0 items even mean?")
        }
        else if (qty === "cancel" || qty === "quit") {
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
            message: "How many would you like to purchase?  Or type \"cancel\" to go to the main menu or \"quit\" to leave.",
            name: "quantity",
            validate: checkForNum
        }
    ])
    .then((response) => {
        var query: string = "SELECT stock_quantity FROM products WHERE ?";
        connection.query(query, 
            {item_id: itemId},
            function(err, res) {
            if (response.quantity === "cancel") {
                displayTableAndStart();
            }
            else if (response.quantity === "quit") {
                console.log("We hope to see you again soon!");
                disconnectFromDB();
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
        })
    })
};

var purchaseConfirmation = function(item: string, itemId: number, qty: number, inStock: number): void {
    var query: string = "SELECT price FROM products WHERE ?";
    var total: string;
    var price: number;
    connection.query(query, 
        {item_id: itemId},
        function(err, res) {
            price = res[0].price;
            total = (qty * price).toFixed(2);
            console.log(`Your purchase for ${qty} of ${item} will amount to $${total}.`);
            inquirer
        .prompt([
            {
                type: "confirm",
                message: "Would you like to finalize this purchase?",
                name: "confirm",
                default: true
            }
        ])
        .then((answer) => {
            if (answer.confirm) {
                updateDB(itemId, qty, inStock);
            }
            else {
                console.log("Not a problem!  Your purchase has been canceled.");
                continueShopping();
            }
        })
    })
}

var updateDB = function(itemId: number, qty: number, inStock: number): void {
    var newValue: number = inStock - qty;
    var query: string = `UPDATE products SET stock_quantity = ${newValue} WHERE ?`;
    connection.query(query, 
        {item_id: itemId},
        function(err, res) {
            console.log("Your purchase was made successfully!  Thank you for shopping with us.");
            continueShopping();
        })
}

var continueShopping = function(): void {
    inquirer
    .prompt([
        {
            type: "confirm",
            message: "Would you like to continue shopping?",
            name: "confirm",
            default: true
        }
    ])
    .then((response) => {
        if (response.confirm) {
            displayTableAndStart();
        }
        else {
            console.log("We hope to see you again soon!");
            disconnectFromDB();
        }
    })
}
// ------------------------------------------------------------------------------
connectToDB();
displayTableAndStart();