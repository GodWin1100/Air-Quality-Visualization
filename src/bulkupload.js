var admin = require("firebase-admin");
var serviceAccount = require("../public/service_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

var wards = require("../public/pop_health_2018.json")

wards.forEach(function(obj) {
    db.collection("pop_health").add(obj).then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
});