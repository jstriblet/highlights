const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
			admin.initializeApp();
const book_book = '';

// ugh
// The module used to parse the inbound email and attachment
const toJSON = require('./toJSON.js');
const CreateBook = require('./CreateBook.js');
const ConfigKey = require('./ConfigKey.js');


// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/email
exports.addMessage = functions.https.onRequest(async (req, res) => {
	
  // Grab the JSON data from the POST request and create an object.
	const json = JSON.stringify(req.body);

	// Convert the buffer from the JSON to text
	const buffer = Buffer.from(JSON.parse(json).data);
	const email  = buffer.toString('utf8');

  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
	const writeResult = await admin.firestore().collection('messages').add({'email': email});
	
  // Send back a message that we've successfully written the message
	res.json({result: `Message with ID: ${writeResult.id} added.`});
});


// Convert the new message to highlights / notes within volumes
exports.addVolume = functions.firestore.document('/messages/{documentId}').onCreate(async (snap, context)=> {

	// Convert the email message to JSON
	const email = snap.data().email;
	const json = toJSON(email);

	const searchDetails = async function(json) {
		const url = `https://www.googleapis.com/books/v1/volumes?q=${json.volume.title.replace(/ /g, '+')}+inauthor:${json.volume.authors[0].replace(/ /g, '+')}&key=${ConfigKey().key}&country=US`
		let response;

		try {
			response = await axios.get(url);
		} catch (err) {
			console.log('Error in searchDetails: ' + err);
		}

		return getBook(response.data);
	}

	const getBook = async function(data) {
		const url = `${data.items[0].selfLink}?&key=${ConfigKey().key}&country=US`;
		let response;

		try {
			response = await axios.get(url);
		} catch (err) {
			console.log('Error in getBook: ' + err)
		}

		json.images = response.data.volumeInfo.imageLinks;
		json.isbn = response.data.volumeInfo.industryIdentifiers;

		return	{
			title   : json.volume.title,
			authors : json.volume.authors,
			images  : json.images,
			ISBN    : json.isbn
		}
	}

	let book = await searchDetails(json);

	console.log(book);
	// Push the volume to the Firestore, and overwrite any existing one
	admin.firestore().collection('volumes').doc(json.volume.title).set({ book : book });

	//img.src =  `https://covers.vitalbook.com/vbid/${volume.book.ISBN[1].identifier}/width/200`
	//// Soon
});

