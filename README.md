MySQL mock storefront
=====================

Compilation (Optional)
----------------------
For your convenience, compiling the TypeScript source (located in `./src`) __is not necessary__.  You'll find the compiled JavaScript in `./lib`.  However, if you wish to compile from source, please ensure that you have TypeScript installed.  TypeScript can be installed globally by running `npm install -g typescript`.  Otherwise, you can install it locally.  First, make sure your current working directory is the root directory of this project.  Then simply run `npm install --save-dev typescript`.

Afterward, simply run `tsc`.  The relevant JavaScript files will be generated and placed inside `./lib`.  If there are already files present in `./lib`, they will be overwritten.

__But it's a hell of a lot easier to just run the JavaScript, so I recommend doing that.__