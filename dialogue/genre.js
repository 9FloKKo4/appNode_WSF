const limdu = require('limdu');

var intentClassifierHello = new limdu.classifiers.EnhancedClassifier({
    classifierType: TextClassifier,
    featureExtractor: WordExtractor
});

// Train and test:
intentClassifierHello.trainBatch([
    { input: "Bonjour", output: "Bonjour et bienvenue ! 🎵 Que puis-je faire pour vous ?" },
    { input: "Salut", output: "Bonjour et bienvenue ! 🎵 Que puis-je faire pour vous ?" },
]);












