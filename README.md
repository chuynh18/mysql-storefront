MySQL mock storefront
=====================

Compilation (Optional)
----------------------
For your convenience, __compiling the TypeScript source (located in `./src`) is not necessary__.  You'll find the compiled JavaScript in `./lib`.  However, if you wish to compile from source, please ensure that you have TypeScript installed.  TypeScript can be installed globally by running `npm install -g typescript`.  Otherwise, you can install it locally.  First, make sure your current working directory is the root directory of this project.  Then simply run `npm install --save-dev typescript`.  This will install TypeScript as a dependency of this project and update `package.json` accordingly.

Afterward, simply run `tsc`.  The relevant JavaScript files will be generated and placed inside `./lib`.  If there are already files present in `./lib`, they will be overwritten.

__But it's a hell of a lot easier to just run the JavaScript, so I recommend doing that.__

Connecting to and seeding the database
--------------------------------------

First, ensure you have a MySQL instance set up and running locally.  __If your database credentials are different, please make the appropriate edits to the `createDbConnection.ts` file.__  You do not need to make edits anywhere else, as I've modularized the database code to this file.  After making edits, be sure to recompile by running `tsc` in the terminal.

The `sql` files that generate the appropriate tables can be found in `./sql`.

`bamazon_products_schema.sql` and `bamazon_products_seed.sql` are collectively responsible for generating the table used by `bamazonCustomer` and `bamazonManager`.

Please be sure to use these `sql` files to create the relevant tables before running the corresponding programs.