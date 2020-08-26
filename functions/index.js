// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
			admin.initializeApp();
// The module used to parse the inbound email and attachment
const toJSON = require('./toJSON.js');



// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
	
  // Grab the JSON data from the POST request and create an object.
	const json = JSON.stringify(req.body);

	// Convert the buffer from the json to text
	const buffer = Buffer.from(JSON.parse(json).data);
	const email  = buffer.toString('utf8');

  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
	const writeResult = await admin.firestore().collection('messages').add({'email': email});
	
  // Send back a message that we've successfully written the message
	res.json({result: `Message with ID: ${writeResult.id} added.`});
});



// Convert the new message to highlights / notes within volumes
exports.addVolume = functions.firestore.document('/messages/{documentId}').onCreate((snap, context)=> {

	// Convert the email message to JSON
	const email = snap.data().email;
	const emailJSON = toJSON(email);
	const title = emailJSON.volume.title;

	// Push the volume to the Firestore, and overwrite any existing one
	admin.firestore().collection('Volumes').doc(title).set({ volume : emailJSON });

	console.log(title);
});



// Download metadata for volume ( Book Cover )
exports.addMetaData = functions.firestore.document('/Volumes/{documentId}').onCreate((snap, context)=> {



	console.log(title);
});
