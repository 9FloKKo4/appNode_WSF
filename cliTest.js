const readline = require('readline');
const add = require('./add');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function AddVinyl() {
    rl.question('Nom du vinyl : ', (nom) => {
        rl.question('Prix : ', (prix) => {
            rl.question('Taille : ', (type) => {
                rl.question('Quantité : ', (stock) => {
                    add.AddVinyl(nom, prix, type, stock);
                    console.log('vinyl ajouté avec succès !');
                    rl.close();
                });
            });
        });
    });
}

AddVinyl();
