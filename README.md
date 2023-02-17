# sequelize-mysql-migrationFilesGenerator
This script helps you create full sequelize migration files from an existing database
## _I Hope This Helps!_

A few things first..
- You need to know your databse dialect (what driver sequelize uses for your database)
- Then you need to run this commands (in your node project)..

```sh
npm i sequelize
npm i sequelize-cli
npx sequelize-cli init
```

By now you should have sequelize setup in your project and if not, you should see [Sequelize/Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)

# Change:
[YOUR_DIALECT] to your specific dialect (If you dont know it yetm see [Migration/Dialects](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/))

[YOUR_DATABASE] to your database name(you kind of need a database want this anyways😅)

[YOUR_DATABASE_USER] to your database user (if you on localhost its most likely "root")

[YOUR_DATABASE_PASSWORD] to your database user password (if you on localhost its most likely "")

[YOUR_DATABASE_HOST] to your database host (url you use to connect with your database)



Then just copy the code (with the changes) from the script above and run it.
If you have any issues I'd be more than happy to help you fix them (with you).

