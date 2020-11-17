const functions = require('firebase-functions');
const admin = require('firebase-admin').initializeApp();
const db = admin.firestore();
const fs = require('fs');
const toJSON = require('./toJSON.js');
const bindBook = require('./bindBook.js');
const cheerio = require("cheerio");

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

	// Check to see if book is already in the databasefz
	await db.collection('volumes').get().then( querySnapshot => {
		if (querySnapshot.size) {
			querySnapshot.forEach(doc => {
				if ( doc.data().book.title === book.title ) {
					book.id = doc.id;
					//console.log('Book found: ', book.id, ' => ', book.title);
				}
			});
		}
	return true;
	});

	if (!book.id) {
		book.id = db.collection('volumes').doc().id;
	}

	// Push the volume to the Firestore, and overwrite any existing one
	db.collection('volumes').doc(book.id).set({ book : book });
});

// Convert the new message to highlights / notes within volumes
exports.createIndexPage = functions.firestore.document('/volumes/{documentId}').onWrite(async (snap, context)=> {

	let content = cheerio.load(`
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<title>Jonathan Striblet's Bookshelf</title>

				<link rel="stylesheet" type="text/css" href="./index.css">	
				<meta name="description" content="A collection of highlights and notes from books and articles.">
			</head>

			<body>
				<div id="root">
					<main id="main" class="l-container l-container--shelf u-margin-top--xl">
						<h1 class="u-antialiased">What I’ve been reading</h1>
						<ul class="c-shelf">
						</ul>
					</main>
				</div>
			</body>
		</html>`);

	function render(volumes) {
		//let shelf = document.getElementsByClassName("c-shelf")[0];
		let shelf = content('.c-shelf', '#root');
		console.log(shelf.html())

		volumes.forEach(volume => {
			let id = volume.book.id;
			let li = cheerio.load('<li></li>');
			let text = cheerio.load('<h2></h2>');
			let img = cheerio.load('<img></img>');
			let link = cheerio.load('<a></a>');
			let figure = cheerio.load('<figure></figure>');
			let coverName = 'Default'; 

			console.log('img exist: ', fs.existsSync( `../public/covers/${id}.jpg`));

			try {
				if (fs.existsSync( `../public/covers/${id}.jpg`)) {
					coverName = id;
				} else {
					coverName = 'Default';
				}
			} catch (e) {
					coverName = 'Default';
			}

			console.log(id, volume.book.title)

			li('li').addClass("c-shelf__volume");
			text('h2').text(volume.book.title.split(':')[0]);

			if (!(volume.book.medium === 'Kindle')) {
				text('h2').append('  🎧');
			}

			text('h2').addClass('c-shelf__volume__title');
			img('img').attr('src', `./covers/${coverName}.jpg`);
			link('a').addClass('c-shelf__link');
			link('a').attr('href', `volume.html?id=${id}`);
			figure('figure').addClass('c-cover');

			figure('figure').append(img.html());
			link('a').append(figure.html());
			link('a').append(text.html());
			li('li').append(link.html());
			content('ul', '#root').append(li.html());

			const tmpdir = os.tmpdir();
			const filePath = path.join(tmpdir, 'index2.htm');

			fs.writeFile(filePath, content.html(), (error) => { /* lord, please let there be no errors */ });
			db.collection('page').doc('index3.html').set({ page : content.html() });
			return true;
		});
	}

	function sortBooks(volumes) {
		volumes.sort((a, b) => { 
			if ( a.book.sync && b.book.sync) 
				return new Date(b.book.sync) - new Date(a.book.sync)
			if (a.book.sync) 
				return -1
			if (b.book.sync) 
				return 1
			return 0;
		});
		return volumes;
	}

	function parse(doc) {
		const result = [];
		doc.forEach((doc) => { 
			result.push(doc.data()) 
		});
		return result;
	}

	function getVolumes() {
			db.collection("volumes")
				.get()
				.then(parse)
				.then(sortBooks)
				.then(render)
				.catch(e => {console.log(e)});
	}
    
	getVolumes();

});

exports.servePage = functions.https.onRequest((req, res) => {
	let doc = db.collection('page').doc('index3.html');
			page = doc.get().then(resi => {
				res.status(200).send(resi.data().page)
				return resi.data().page;
			});
});



//http://localhost:5001/highlights-ec45b/us-central1/servePage







