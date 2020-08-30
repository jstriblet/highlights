const https = require('https');
/**
 * Ask Google for Book title, Volume ID, and ISBN
 * @param {String} title
 * @param {Array<String>} authors
 * @returns {Object}
 */
const Book = function(title, authors) {
  this.title = title;
  this.authors = authors;
	this.imageLinks;
	this.ISBN;
};

Book.prototype.searchDetails = function() {
	https.get(`https://www.googleapis.com/books/v1/volumes?q=
			${this.title.replace(/ /g, '+')}+inauthor:${this.authors[0]}`, 
		resp => {
			let data = '';
			resp.on('data', (chunk) => { data += chunk });
			resp.on('end', () => {
				data = JSON.parse(data);
				console.log('inside search details'); 
				this.getBook(data);
			});
		})
		.on('error', (err) => {
			console.log('Error: ' + err.message);
		});
}

Book.prototype.getBook = function(data) {
	const url = data.items[0].selfLink;
	https.get(url, resp => {
		let data = '';
		resp.on('data', (chunk) => { data += chunk; });
		resp.on('end', () => {
			data = JSON.parse(data);
			this.imageLinks = data.volumeInfo.imageLinks;
			this.ISBN = data.volumeInfo.industryIdentifiers;
			console.log('inside get book');
		});
	});
}

Book.prototype.getDetails = function() {
	this.searchDetails();
}

module.exports = Book;

