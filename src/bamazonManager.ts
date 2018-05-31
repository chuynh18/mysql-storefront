import inquirer = require("inquirer");
import { connection } from "./createDbConnection"; // provides mysql npm package + connects to db
import { connectToDB } from "./createDbConnection";
import { disconnectFromDB } from "./createDbConnection";
import { sendTitles } from "./tableMaker"; // creates tables
import { makeTable } from "./tableMaker";
import { sanitize } from "./sanitizeText"; // makes it so I can use ', ", ` in items
import { printLogo } from "./bamazonLogo"; // prints bamazon logo

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

// draws the product table
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
        var itemId: number;
        for (var i: number = 0; i < choices.length; i++) {
            if (response.update === choices[i].name) {
                itemId = choices[i].id;
            }
        }
        updateProductQuantity(itemId, response.update);
    })
}

var updateProductQuantity = function(itemId: number, name: string): void {
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
            addToInventory(itemId, name, parseInt(response.quantity));
        }
        else if (parseInt(response.quantity) < 0) {
            console.log("Sorry, please enter a valid number.");
            updateProductQuantity(itemId, name);
        }
    })
}

var addToInventory = function(itemId: number, name: string, qty: number): void {
    console.log(`Adding ${qty} to our stock of ${name}.  Here's the quantity before the update...`);
    displayTable(`SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products WHERE product_name = '${name}'`);
    console.log("");

    var query: string = `UPDATE products SET stock_quantity=stock_quantity+${qty} WHERE item_id=${itemId}`;
    connection.query(query,
    function(err, res) {
        console.log("\nQuantity updated.  Please confirm...");
        displayTable(`SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products WHERE product_name = '${name}'`);
        setTimeout(mainMenu, 100);
    })
}

var addProduct = function(): void {
    function notNull(input: string): string | boolean {
        if (!input || input === "") {
            return "Sorry, this cannot be blank.  Please enter something";
        }
        else {return true;}
    }
    function checkForNum(qty: any): boolean | string {
        if (!qty || qty === "0" || qty === "") {
            return "Please enter a number greater than 0.";
        }
        else if (/^[0-9]/.test(qty)) {
            return true;
        }
        else {return "Please enter a number."}
    }
    connection.query("SELECT department_name FROM bamazon.departments", function(err, res) {
        var departments = [];
        res.forEach(element => {
            departments.push(element.department_name);
        })
        inquirer
        .prompt([
            {
                type: "input",
                message: "Enter product name.  This can't be blank.",
                name: "name",
                validate: notNull
            },
            {
                type: "list",
                message: "Enter product's department.",
                name: "department",
                choices: departments
            },
            {
                type: "input",
                message: "Enter product's manufacturer, author, artist, maker, etc.",
                name: "maker"
            },
            {
                type: "input",
                message: "Enter product description.",
                name: "description"
            },
            {
                type: "input",
                message: "Enter product price.",
                name: "price",
                validate: checkForNum
            },
            {
                type: "input",
                message: "Enter product quantity (how many we have in stock).",
                name: "quantity",
                validate: checkForNum
            }
        ])
        .then(response => {
            var name = sanitize(response.name);
            var department = sanitize(response.department);
            var maker = sanitize(response.maker);
            var description = sanitize(response.description);
            var price = parseFloat(response.price).toFixed(2);
            var quantity = parseInt(response.quantity);

            var query = `INSERT INTO products (product_name, department_name, maker, product_description, price, stock_quantity) VALUES ('${name}', '${department}', '${maker}', '${description}', ${price}, ${quantity})`;
            connection.query(query, function(err, res) {
                console.log("Product inserted:");
                displayTable(`SELECT item_id, department_name, product_name, maker, price, stock_quantity FROM products WHERE product_name = '${name}'`);
                setTimeout(mainMenu,100);
            })
        })
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
            addProduct();
            break;

            case "Quit":
            disconnectFromDB();
            break;
        }
    })
}
// ---------------------------- function calls ----------------------------
printLogo();
setTimeout(mainMenu, 420);