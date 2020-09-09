const https = require('https');
const axios = require('axios');

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
	const url = `https://www.googleapis.com/books/v1/volumes?q=${this.title.replace(/ /g, '+')}+inauthor:${this.authors[0].replace(/ /g, '+')}`
	let response;
	console.log(url)

	try {
		response = await axios.get(url);
	} catch (err) {
		console.log('Error in searchDetails: ' + err);
	}

	console.log(response.data);

	return this.getBook(response.data);
}

Book.prototype.getBook = async function(data) {
	const url = `${data.items[0].selfLink}?`;
	let response;

	try {
		response = await axios.get(url);
	} catch (err) {
		console.log('Error in getBook: ' + err)
	}

	this.images = response.data.volumeInfo.imageLinks;
	this.isbn = response.data.volumeInfo.industryIdentifiers;

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

