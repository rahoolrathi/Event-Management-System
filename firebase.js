// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./rentersite-app-4562bd47508d.json'); // Update the path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
