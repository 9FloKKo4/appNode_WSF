const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('vinyl.db');

function AddVinyl(nom , prix , stock , genre , type ) {
    db.serialize(() => {
        const stmt = db.prepare('INSERT INTO Product (nom, prix, stock, genre, type) VALUES (?, ?, ?, ?, ?)');
        {
            stmt.run(nom, prix, stock, genre, type); 
        }
        stmt.finalize();
    });
}

module.exports = { AddVinyl };
