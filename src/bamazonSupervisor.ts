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
        sendTitles(["DEPARTMENT ID", "DEPARTMENT", "OVERHEAD COSTS", "PRODUCT SALES", "DEPARTMENT REVENUE"]);
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        console.log(res);
        makeTable(res);
    })
}

var mainMenu = function(): void {
    inquirer
    .prompt([
        {
            type: "list",
            message: "Welcome, supervisor!  What would you like to do?",
            choices: ["View Product Sales by Department", "Create New Department", "Quit"],
            name: "manage"
        }
    ])
    .then((response) => {
        switch (response.manage) {
            case "View Product Sales by Department":
            displayTable("SELECT d.department_id,	p.department_name, d.over_head_costs, SUM(p.product_sales) AS 'product_sales', (SUM(p.product_sales) - d.over_head_costs) AS 'department_revenue' FROM products p INNER JOIN departments d ON p.department_name = d.department_name GROUP BY d.department_id");
            setTimeout(mainMenu,100);
            break;

            case "Create New Department":
            // code here
            setTimeout(mainMenu,100);
            break;

            case "Quit":
            disconnectFromDB();
            break;
        }
    })
}
// ------------------------------------------------------------------------------
printLogo();
setTimeout(mainMenu, 420);