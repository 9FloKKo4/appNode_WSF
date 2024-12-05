const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('Vinyl.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS Product (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, prix REAL, stock INTEGER, genre TEXT, type TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS Account (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, prenom TEXT, mail TEXT, role TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS Orders (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, prix_total REAL, account TEXT)");
});

db.close();
