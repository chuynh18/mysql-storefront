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
var displayTable = function(query: string, buildMenu?: boolean, titles?: string[]): void {
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
        if (titles) {
            sendTitles(titles);
        }
        else {
            sendTitles(["DEPARTMENT ID", "DEPARTMENT", "OVERHEAD COSTS", "PRODUCT SALES", "DEPARTMENT REVENUE"]);
        }
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        makeTable(res);
        setTimeout(mainMenu,200);
    })
}

var addDepartment = function(): void {
    function notNull(input: string): string | boolean {
        if (!input || input === "") {
            return "Sorry, this cannot be blank.  Please enter something";
        }
        else {return true;}
    }
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
            message: "Enter the new department's name.",
            name: "department",
            validate: notNull
        },
        {
            type: "input",
            message: "Enter the department's overhead costs.",
            name: "overhead",
            validate: checkForNum
        }
    ])
    .then(response => {
        confirmCreation(response.department, parseFloat(response.overhead));
    })
}

var confirmCreation = function(dept: string, overhead: number): void {
    inquirer
    .prompt([
        {
            type: "confirm",
            message: `The ${dept} department will be created with overhead costs of ${overhead}.  Please confirm.`,
            name: "confirm",
            default: true
        }
    ])
    .then(response => {
        if (response.confirm) {
            connection.query(`SELECT department_name FROM bamazon.departments`, function(err, res) {
                if (err) throw err;
                var dupe = false;
                res.forEach(element => {
                    if (element.department_name === dept) {
                        dupe = true;
                        console.log(`Sorry, the ${dept} department already exists.  Please try again.`);

                    }
                })
                if (!dupe) {
                    var query: string = `INSERT INTO departments (department_name, over_head_costs) VALUES ('${dept}', '${overhead}')`;
                    connection.query(query, function(err, res) {
                        if (err) throw err;
                        console.log("Department added.");
                        displayTable(`SELECT * FROM bamazon.departments WHERE department_name = '${dept}'`, false, ["DEPARTMENT ID", "DEPARTMENT NAME", "OVERHEAD COSTS"]);
                    })
                }
                else {
                    addDepartment();
                }
            })
        }
        else {
            console.log("Department creation canceled.");
            mainMenu();
        }
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
            displayTable("SELECT d.department_id, d.department_name, d.over_head_costs, SUM(IFNULL(p.product_sales, 0)) AS 'product_sales', (SUM(IFNULL(p.product_sales, 0)) - d.over_head_costs) AS 'department_revenue' FROM products p RIGHT JOIN departments d ON p.department_name = d.department_name GROUP BY d.department_id");
            break;

            case "Create New Department":
            addDepartment();
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