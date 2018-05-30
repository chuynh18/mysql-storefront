About tableMaker
================

Introduction
------------
Instead of using an npm package such as `cli-table` or `cli-table2`, I decided to write my own tablemaking code.  Originally, this was single-purpose code that was pretty inflexible and lived alongside the rest of the main program (in this case, `bamazonCustomer.ts`).  However, this was pretty inelegant and very hardcoded, so I decided to fully separate out the tablemaking code.  Now it is fully independent and can be used to draw tables for any MySQL response object.

How to use
----------
My tableMaker code is invoked via two function calls.

1. First, import the two functions exposed by `tableMaker.ts`.  This is done like so: <pre>import { sendTitles } from "./tableMaker";
import { makeTable } from "./tableMaker";</pre>

1. Execute your MySQL query.

1. Next, send the user-facing column headers that will appear in the table header to tableMaker by calling `sendTitles()`.  Each title should be a string in an array: `sendTitles("Your", "User", "Facing", "Column", "Headers", "Here")`.

1. Lastly, send the MySQL response object to tableMaker.

1. Overall, it'll look something like this...

<pre>import { sendTitles } from "./tableMaker";
import { makeTable } from "./tableMaker";</pre>

<pre>// Other code you might have, such as actually connecting to your database</pre>

<pre>var query: string = "(YOUR MYSQL QUERY GOES HERE)";
connection.query(query, function(err, res) {
    if (err) throw err;
    sendTitles("Your", "User", "Facing", "Column", "Headers", "Here");
    makeTable(res);
}</pre>

In the above example, there are six arguments passed to `sendTitles()`.  Therefore, the MySQL response object should contain six keys.

Assumptions and gotchas
-----------------------
I'm using the mysql npm package located at https://www.npmjs.com/package/mysql.  There may be other MySQL libraries, and they may format their responses differently.  tableMaker expects the response to be an array of objects.

Take care to have the number and order of arguments to `sendTitles()` match the number and order of columns you are `SELECT`ing in your MySQL query.