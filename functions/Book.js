const https = require('https');
/**
 * Ask Google for Book title, Volume ID, and ISBN
 * @param {String} title
 * @param {Array<String>} authors
 * @returns {Object}
 */
const Book = function(title, authors) {
  this.title = title;
	this.urlTitle = title.replace(/ /g, '+');
  this.authors = authors;
	this.bookDetails = {};
};

Book.prototype.parse = function(resp) {
	let data = '';
	resp.on('data', (chunk) => { data += chunk; });
	resp.on('end', () => {
		data = JSON.parse(data);
		//this.bookDetails.volumeId = data.items[0].id;
		//this.bookDetails.image = this.getImage(data.items[1].selfLink);
		console.log(data.items[0].selfLink)
	}); 
}

Book.prototype.search = function() {
	https.get(`https://www.googleapis.com/books/v1/volumes?q=${this.urlTitle}+inauthor:${this.authors[0]}`, this.parse)
		.on('error', (err) => {
			console.log('Error: ' + err.message);
		});
}

Book.prototype.getDetails = function() {
	this.search();
	return this.bookDetails;
}

module.exports = Book;

