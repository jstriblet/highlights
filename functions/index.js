const functions = require('firebase-functions');
const admin = require('firebase-admin');
			admin.initializeApp();
const db = admin.firestore();

// The module used to parse the inbound email and attachment
const toJSON = require('./toJSON.js');
const bindBook = require('./bindBook.js');

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/email
exports.addMessage = functions.https.onRequest(async (req, res) => {
	
  // Grab the JSON data from the POST request and create an object.
	const json = JSON.stringify(req.body);

	// Convert the buffer from the JSON to text
	const buffer = Buffer.from(JSON.parse(json).data);
	const email  = buffer.toString('utf8');

  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
	const writeResult = await db.collection('messages').add({'email': email});
	
  // Send back a message that we've successfully written the message
	res.json({result: `Message with ID: ${writeResult.id} added.`});
});


// Convert the new message to highlights / notes within volumes
exports.addVolume = functions.firestore.document('/messages/{documentId}').onCreate(async (snap, context)=> {

	// Convert the email message to JSON
	const email = snap.data().email;
	const json = await toJSON(email);
	const book = await bindBook(json);

	// Check to see if book is already in the database
	await db.collection('volumes').get().then( querySnapshot => {
		if (querySnapshot.size) {
			querySnapshot.forEach(doc => {
				if ( doc.data().book.title === book.title ) {
					book.id = doc.id;
					console.log('Book found: ', book.id, ' => ', book.title);
				}
			});
		}
	return true;
	});

	if (!book.id) {
		book.id = db.collection('volumes').doc().id;
	}

	//console.log(book);

	// Push the volume to the Firestore, and overwrite any existing one
	db.collection('volumes').doc(book.id).set({ book : book });
});

