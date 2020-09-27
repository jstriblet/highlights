const axios = require('axios');
const ConfigKey = require('./ConfigKey.js');

/**
 * Ask Google for Book title, Volume ID, and ISBN
 * @param {String} title
 * @param {Array<String>} authors
 * @returns {Object}
 */
const Book = function(json) {
	this.json = json;
	this.highlights = json.highlights;
	this.medium = json.medium;
	this.sync = json.sync;
  this.title = json.volume.title;
  this.authors = json.volume.authors;
	this.images;
	this.isbn;
};

Book.prototype.valid = function() {
	return this.medium == "Audible" || this.medium == "Kindle";
}

Book.prototype.searchForBook = async function() {
	//const url = `https://www.googleapis.com/books/v1/volumes?q=${this.title.replace(/ /g, '+')}+inauthor:${this.authors[0].replace(/ /g, '+')}`
	const url = `https://www.googleapis.com/books/v1/volumes?q=${this.title.replace(/ /g, '+')}+inauthor:${this.authors[0].replace(/ /g, '+')}&key=${ConfigKey().key}&country=US`
	let response;
	console.log(url)

	try {
		response = await axios.get(url);
	} catch (err) {
		console.log('Error in searchForBook: ' + err);
	}

	//console.log(response.data);

	return this.bindBook(response.data);
}

Book.prototype.bindBook = async function(data) {
	const url = `${data.items[0].selfLink}?`;
	let response;

	try {
		response = await axios.get(url);
	} catch (err) {
		console.log('Error in bindBook: ' + err)
	}

	this.images = response.data.volumeInfo.imageLinks;
	this.isbn = response.data.volumeInfo.industryIdentifiers;
console.log(this.images);
	return	{
		json    : this.json,
		title   : this.title,
		authors : this.authors,
		images  : this.images,
		ISBN    : this.isbn
	}
}

Book.prototype.getBook = async function() {
	return await this.searchForBook();
}

module.exports = Book;

	//const newBook = new Book(json);
	//const bookDetails = Book.getDetails();

	//const searchDetails = async function(json) {
		//const url = `https://www.googleapis.com/books/v1/volumes?q=${json.volume.title.replace(/ /g, '+')}+inauthor:${json.volume.authors[0].replace(/ /g, '+')}&key=${ConfigKey().key}&country=US`
		//let response;

		//try {
			//response = await axios.get(url);
		//} catch (err) {
			//console.log('Error in searchDetails: ' + err);
		//}

		//return getBook(response.data);
	//}

	//const getBook = async function(data) {
		//const url = `${data.items[0].selfLink}?&key=${ConfigKey().key}&country=US`;
		//let response;

		//try {
			//response = await axios.get(url);
		//} catch (err) {
			//console.log('Error in getBook: ' + err)
		//}

		//json.images = response.data.volumeInfo.imageLinks;
		//json.isbn = response.data.volumeInfo.industryIdentifiers;

		//return	{
			//title   : json.volume.title,
			//authors : json.volume.authors,
			//images  : json.images,
			//ISBN    : json.isbn
		//}
	//}

	//let book = await searchDetails(json);

	//console.log(book);
