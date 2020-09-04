const https = require('https');
const bent = require('bent');
/**
 * Ask Google for Book title, Volume ID, and ISBN
 * @param {String} title
 * @param {Array<String>} authors
 * @returns {Object}
 */
const Book = function(json) {
	this.json = json;
	this.highlights = json.highlights;
  this.title;
  this.authors;
	this.images;
	this.isbn;
};

Book.prototype.setTitle = function() {
	this.title = this.json.volume.title.split(' ').slice(0, 3).join(' ');
}

Book.prototype.setAuthors = function() {
	this.authors = this.json.volume.authors;
}

Book.prototype.searchDetails = async function() {
	const get = bent(`https://www.googleapis.com/books`, 'GET', 'json', 200);
	const response = await get(`/v1/volumes?q=${this.title.replace(/ /g, '+')}+inauthor:${this.authors[0]}`);

	return this.getBook(response);
}

Book.prototype.getBook = async function(data) {
	const url = data.items[0].selfLink;
	const get = bent(url, 'GET', 'json', 200);
	const response = await get();

	this.images = response.volumeInfo.imageLinks;
	this.isbn = response.volumeInfo.industryIdentifiers;

	return	{
		json    : this.json,
		title   : this.title,
		authors : this.authors,
		images  : this.images,
		ISBN    : this.isbn
	}
}

Book.prototype.getDetails = async function() {
	this.setTitle();
	this.setAuthors();

	return await this.searchDetails();
}

module.exports = Book;

