const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USERDB,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
});


class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllData(orderby, order) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM words ORDER BY ${orderby} ${order};`;

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }


    async processWord(name) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query = 'SELECT * FROM words WHERE name = ?';
                connection.query(query, [name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    if (results.length > 0) {
                        const existingCount = results[0].count;
                        const updateQuery = 'UPDATE words SET count = ? WHERE name = ?';
                        connection.query(updateQuery, [existingCount + 1, name], (error, result) => {
                            if (error) reject(new Error(error.message));
                            resolve(result.insertId);
                        });
                    }
                    else {
                        const insertQuery = 'INSERT INTO words (name) VALUES (?)';
                        connection.query(insertQuery, [name], (error, result) => {
                            if (error) reject(new Error(error.message));
                            resolve(result.insertId);
                        });
                    }
                });
            });
            return {
                id : insertId,
                name : name
            };
        } catch (error) {
            console.log(error);
        }
    }

    async deleteRowById(id) {
            try {
                id = parseInt(id, 10);
                const response = await new Promise((resolve, reject) => {
                    const query = "DELETE FROM words WHERE id = ?";

                    connection.query(query, [id], (err, result) => {
                        if (err) reject(new Error(err.message));
                        resolve(result.affectedRows);
                    })
                });

                return response === 1 ? true : false;
            } catch (error) {
                console.log(error);
                return false;
            }
        }

    async updateNameById(id, name) {
            try {
                id = parseInt(id, 10);

                const response = await new Promise((resolve, reject) => {
                    const query = "UPDATE words SET name = ? WHERE id = ?";

                    connection.query(query, [name, id], (err, result) => {
                        if (err) reject(new Error(err.message));
                        resolve(result.affectedRows);
                    })
                });

                return response === 1 ? true : false;
            } catch (error) {
                console.log(error);
                return false;
            }
        }

    async searchByName(name) {
            try {
                const response = await new Promise((resolve, reject) => {
                    const query = "SELECT * FROM words WHERE name = ?;";

                    connection.query(query, [name], (err, results) => {
                        if (err) reject(new Error(err.message));
                        resolve(results);
                    })
                });

                return response;
            } catch (error) {
                console.log(error);
            }
        }
    }

module.exports = DbService;