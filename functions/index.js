// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query;
	const keys = JSON.stringify(req.body);
	res.json({result: `${keys}`});

  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
	const writeResult = await admin.firestore().collection('messages').add({'keys': keys});
  // Send back a message that we've succesfully written the message
  //res.json({result: `Message with ID: ${writeResult.id} added.`});
});

const express = require('express');
const cors = require('cors');
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/hello', (req, res) => {
  res.end("Received GET request!");  
});

app.post('/post', (req, res) => {
	admin.firestore().collection('post data').add({'data': Object.keys(req.body)});
  res.end("Received POST request!");  
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);
