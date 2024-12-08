const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de données
const db = new sqlite3.Database('Vinyl.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err.message);
        return;
    }
    console.log('Connecté à la base de données SQLite.');
});

// Création des tables si elles n'existent pas déjà
db.serialize(() => {
    // Table des utilisateurs
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL,
            salt TEXT NOT NULL
        );
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table "users" :', err.message);
        } else {
            console.log('Table "users" vérifiée/créée.');
        }
    });

    // Table des produits
    db.run(`
        CREATE TABLE IF NOT EXISTS product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            genre TEXT NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            prix REAL NOT NULL
        );
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table "product" :', err.message);
        } else {
            console.log('Table "product" vérifiée/créée.');
        }
    });

    // Table des commandes
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (product_id) REFERENCES product (id)
        );
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table "orders" :', err.message);
        } else {
            console.log('Table "orders" vérifiée/créée.');
        }
    });

    console.log('Base de données initialisée avec succès.');
});

// Fermer la connexion
db.close((err) => {
    if (err) {
        console.error('Erreur lors de la fermeture de la base de données :', err.message);
    } else {
        console.log('Connexion à la base de données fermée.');
    }
});
