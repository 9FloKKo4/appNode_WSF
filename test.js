var limdu = require('limdu');
const prompt = require("prompt-sync")({ sigint: true });
const db = require('./vinyleModel');




(async function() {

	const vinyles = await db.getAllVinyle()
	console.log(vinyles)
	// First, define our base classifier type (a multi-label classifier based on winnow):
	var TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
		binaryClassifierType: limdu.classifiers.Winnow.bind(0, {retrain_count: 10})
	});

	// Now define our feature extractor - a function that takes a sample and adds features to a given features set:
	var WordExtractor = function(input, features) {
		input.split(" ").forEach(function(word) {
			features[word]=1;
		});
	};

	// Initialize a classifier with the base classifier type and the feature extractor:
	var intentClassifier = new limdu.classifiers.EnhancedClassifier({
		classifierType: TextClassifier,
		featureExtractor: WordExtractor
	});

	// Train and test:
	intentClassifier.trainBatch([
		{input: "Je veux boire un barcadi", output: "barcadi"},
	]);


	// Initialize a classifier with the base classifier type and the feature extractor:
	var intentClassifierAccept = new limdu.classifiers.EnhancedClassifier({
		classifierType: TextClassifier,
		featureExtractor: WordExtractor
	});

	// Train and test:
	intentClassifierAccept.trainBatch([
		{input: "Je veux bien cette boisson", output: "oui"},
		{input: "Donne moi !", output: "oui"},
		{input: "je prends", output: "oui"},
		{input: "ok", output: "oui"},
		{input: "je ne prends pas", output: "no"},
		{input: "Non c'est trop chère", output: "non"},
		{input: "Non je veux pas", output: "non"},
		{input: "Non sait pas !", output: "non"},
	]);



	console.log('Bonjour')
	const rhum_want = prompt("Pouvez-vous me dire le rhum que vous souhaitez (Nick, Barcardi, Morgan) possible ?");
	predicted_response = intentClassifier.classify(rhum_want);

	let current_boisson = null
	// console.log('predicted_response', predicted_response)
	for (boison of vinyles) {
		if (boison.name == predicted_response[0]) {
			console.log("La boison", boison['name'], "est de", boison['price'], " EUR")
			current_boisson = boison 
			break
		}
	}

	const yesno = prompt(`Souhaitez-vous payer votre ${current_boisson.name} ?`);
	predicted_response = intentClassifierAccept.classify(yesno);
	if (predicted_response[0] == 'non') {
		console.log('Merci et à la prochaine!')
	}

	if (predicted_response[0] == 'oui') {

		const want_qty = prompt(`De combien de ${current_boisson.name} avez-vous besoin ?`);
		console.log(`Voulez-vous  ${Number(want_qty)} ${current_boisson.name}(s)`)
		boisson_from_db = await db.getBoisonById(current_boisson.id)
		if ((boisson_from_db.quantity <= 0)) {
			console.log(`Nous n'avons plus de ${boisson_from_db.name}!`)
		} else if ((boisson_from_db.quantity - Number(want_qty)) <= 0) {
			console.log(`Nous n'avons pas suffisamment de ${boisson_from_db.name} pour vous servir!`)
		} else {
			db.updateBoisson(current_boisson.id, boisson_from_db.quantity - Number(want_qty))
			if (Number(want_qty) == 1) {
				console.log('Ok merci prennez votre boisson!')
			} else {
				console.log('Ok merci prennez vos vinyles!')
			}
		}
	}

})()


//____________________________________________


// 1. Connecter à la base de données
const db1 = new sqlite3.Database('./vinyle.db');

// 2. Définir un classifieur avec limdu
const ChatBot = new limdu.classifiers.Bayesian();

// 3. Entraîner le chatbot avec des questions générales
ChatBot.trainBatch([
  { input: "Bonjour", output: "Bonjour et bienvenue ! 🎵 Que puis-je faire pour vous ?" },
  { input: "Comment fonctionne la livraison ?", output: "Nous offrons une livraison standard à 4,99 € (gratuite dès 50 €) ou express à 9,99 €." },
  { input: "Avez-vous des promotions ?", output: "Nous avons des offres spéciales sur certains vinyles de jazz et rock. Demandez-moi un artiste ou un genre !" },
]);

// 4. Fonction pour rechercher des vinyles dans la base de données
function searchVinylsByKeyword(keyword, callback) {
  db.all(
    `SELECT * FROM vinyls WHERE artist LIKE ? OR album LIKE ? OR genre LIKE ?`,
    [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
    (err, rows) => {
      if (err) {
        callback("Désolé, une erreur est survenue lors de la recherche.");
      } else if (rows.length === 0) {
        callback("Je n'ai trouvé aucun vinyle correspondant à votre recherche.");
      } else {
        let response = "Voici ce que j'ai trouvé :\n";
        rows.forEach((vinyl) => {
          response += `🎵 ${vinyl.album} de ${vinyl.artist} (${vinyl.genre}) - ${vinyl.price} €\n`;
        });
        callback(response);
      }
    }
  );
}

// 5. Fonction pour gérer les interactions utilisateur
function askChatBot(question) {
  const botResponse = ChatBot.classify(question);

  if (botResponse.includes("recherche")) {
    const keyword = question.split(" ").pop(); 
    searchVinylsByKeyword(keyword, (response) => {
      console.log("ChatBot : " + response);
    });
  } else {
    console.log("ChatBot : " + botResponse);
  }
}


console.log("Client : Bonjour");
askChatBot("Bonjour");

console.log("\nClient : Je cherche un vinyle de Pink Floyd");
askChatBot("Je cherche un vinyle de Pink Floyd");

console.log("\nClient : Qu'avez-vous en jazz ?");
askChatBot("Qu'avez-vous en jazz ?");



