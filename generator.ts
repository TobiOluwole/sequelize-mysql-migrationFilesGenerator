
    const sequelize = new Sequelize('[YOUR_DATABASE]', '[YOUR_DATABASE_USER]', '[YOUR_DATABASE_PASSWORD]', {
        host: '[YOUR_DATABASE_HOST]',
        dialect: '[YOUR_DIALECT]'
    });

    const typeMap = {
        'int(11)': 'INTEGER',
        'varchar(255)': 'STRING',
        'varchar(25)': 'STRING',
        'varchar(36)': 'STRING',
        'text': 'TEXT',
        'datetime': 'DATE',
        'timestamp': 'DATE',
        'date': 'DATE',
        'tinyint(1)': 'BOOLEAN',
        'float': 'FLOAT',
        'double': 'DOUBLE',
        'decimal': 'DECIMAL',
        'char(36)': 'CHAR',
        'time': 'TIME',
    };

    sequelize
        .authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');

            const constraints = [];


            let indexPage = `
            'use strict';
            
            /** @type {import('sequelize-cli').Migration} */
            module.exports = {
                async up(queryInterface, Sequelize) {`;

            let constraintPage = `
                'use strict';
                
                /** @type {import('sequelize-cli').Migration} */
                module.exports = {
                    async up(queryInterface, Sequelize) {`;



            sequelize.queryInterface.showAllTables().then(tables => {
                var bar = new Promise<void>((resolve, reject) => {
                    tables.forEach(async tableName => {

                        await sequelize.queryInterface.showIndex(tableName).then(index => {


                            indexPage += `
                        await queryInterface.tableExists('${tableName}').then(async () => {`;


                            index.forEach(i => {
                            let fields = []
                                console.log(i)
                                if (i.name !== 'PRIMARY') {
                                    i.fields.forEach(field => {
                                        fields.push(`'` + field.attribute.toString() + `'`)
                                    })

                                    indexPage += `
                            await queryInterface.addIndex('${tableName}', [${[...fields]}], {
                            `;

                                    indexPage += `
                            name: '${'auto_' + tableName + Date.now()}',
                            ${i.unique ? 'unique: true,' : ''}
                            })
                            `;
                                }
                            })


                            indexPage += `
                        })`;

                        })


                        const constraints = await sequelize.queryInterface.sequelize.query(`SHOW CREATE TABLE ${tableName}; `, {
                            type: QueryTypes.SELECT
                        }).then(res => {
                            res.forEach(line => {
                                let lines = line['Create Table'].split("\n");
                                for (let i = 0; i < lines.length; i++) {
                                    if (lines[i].startsWith("  CONSTRAINT")) {


                                        constraintPage += `
                                        await queryInterface.tableExists('${tableName}').then(async () => {
                                            `;

                                        let idents = lines[i].split(" ");
                                        constraintPage += `queryInterface.addConstraint('${tableName}', {
                                            fields: ['${idents[6].replace(/[^a-zA-Z0-9 ]/g, '')}'],
                                            ${(idents[4] == 'FOREIGN' && idents[5] == 'KEY') ? 'type: \'foreign key\',' : ''}
                                            name: ${idents[3]},
                                            references: {
                                                table: ${idents[8]},
                                                field: '${idents[9].replace(/[^a-zA-Z0-9 ]/g, '')}'
                                            },
                                            ${(idents[12] == 'NO ACTION' || idents[12] == 'RESTRICT' || idents[12] == 'CASCADE' || idents[12] == 'SET NULL') ? 'onDelete: \'' + idents[12].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '') + '\'' + ',' : ''}
                                            ${(idents[15] == 'NO ACTION' || idents[15] == 'RESTRICT' || idents[15] == 'CASCADE' || idents[15] == 'SET NULL') ? 'onUpdate: \'' + idents[15].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '') + '\'' : ''}
                                        });`
                                        constraintPage += `
                                    })`;
                                    }
                                }
                            })
                        });

                        await sequelize.queryInterface.describeTable(tableName).then(attributes => {
                            let migration = `'use strict';
      module.exports = {
        up: (queryInterface, Sequelize) => {
          return queryInterface.createTable('${tableName}', {`;

                            Object.keys(attributes).forEach(attributeName => {
                                let attributeType = typeMap[attributes[attributeName].type.toLowerCase()];
                                if (attributes[attributeName].type.toString().startsWith('ENUM')) {
                                    attributeType = attributes[attributeName].type.toString()
                                };
                                if (!attributeType) {
                                    console.log(`Unknown data type ${attributes[attributeName].type} for attribute ${attributeName} in table ${tableName}. Skipping...`);

                                    console.log(attributes[attributeName].type)

                                } else {


                                    migration += `\n      ${attributeName}: {
              type: Sequelize.${attributeType},
              allowNull: ${attributes[attributeName].allowNull}`;

                                    if (attributeName == 'id') {
                                        migration += `,
              primaryKey: true`;
                                    }

                                    if (!attributes[attributeName].allowNull) {
                                        if (attributeName == 'createdAt' || attributeName == 'updatedAt' || attributeName == 'deletedAt') {
                                            migration += `, defaultValue: Sequelize.fn('now')`;
                                        } else {
                                            migration += `,
              ${attributes[attributeName].defaultValue ? 'defaultValue: ' + attributes[attributeName].defaultValue : ''}`;
                                        }
                                    }

                                    if (attributes[attributeName].autoIncrement) {
                                        migration += `autoIncrement: ${attributes[attributeName].autoIncrement}`;
                                    }

                                    migration += `\n      },`;
                                }
                            });

                            migration = migration.slice(0, -1);
                            migration += `\n    });
        },
      
        down: (queryInterface, Sequelize) => {
          return queryInterface.dropTable('${tableName}');
        }
      };`;

                            fs.writeFile(`migrations/${Date.now()}-${tableName}.js`, migration, function (err) {
                                if (err) return console.log(err);
                                console.log(`Migration for table ${tableName} was created successfully.`);
                            });

                        });

                        resolve();
                    })
                }).then(() => {


                    indexPage += `
                },
            
                async down(queryInterface, Sequelize) {
                    // rollback transaction
                }
            };`;

                    constraintPage += `
        },
    
        async down(queryInterface, Sequelize) {
            // rollback transaction
        }
    };`;
                    fs.writeFile(`migrations/yzz9999999-indexes.js`, indexPage, function (err) {
                        if (err) return console.log(err);
                        console.log(`Index file was created successfully.`);
                    });
                    fs.writeFile(`migrations/zzz9999999-constraints.js`, constraintPage, function (err) {
                        if (err) return console.log(err);
                        console.log(`Constraint file was created successfully.`);
                    });

                })

            });
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
