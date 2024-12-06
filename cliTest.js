const readline = require('readline');
const add = require('./add');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function AddVinyl() {
    rl.question('Nom du vinyl : ', (nom) => {
        rl.question('Prix : ', (prix) => {
            rl.question('Quantité : ', (stock) => {
                rl.question('genre : ', (genre) => {
                    rl.question('type : ', (type) => {
                        add.AddVinyl(nom, prix, stock, genre, type,);
                        console.log('vinyl ajouté avec succès !');
                        rl.close();
                    });
                });
            });
        });
    });
}

AddVinyl();
