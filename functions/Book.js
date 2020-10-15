const axios = require('axios');
const ConfigKey = require('./ConfigKey.js');
const fs = require('fs');

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
	this.isbn = [];
};

Book.prototype.valid = function() {
	return this.medium === "Audible" || this.medium === "Kindle";
}

Book.prototype.searchForBook = async function() {
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
	let i = 0

	while(this.isbn.length == 0) {
		const url = `${data.items[i].selfLink}?key=${ConfigKey().key}&country=US`;
		let response;

		try {
			response = await axios.get(url);
		} catch (err) {
			console.log('Error in bindBook: ' + err)
		}

		this.images = response.data.volumeInfo.imageLinks || '';
		this.highlights = this.highlights || '';
		this.isbn = response.data.volumeInfo.industryIdentifiers || [];
		i++;
	}

	return	{
		json       : this.json,
		title      : this.title,
		authors    : this.authors,
		medium     : this.medium,
		images     : this.images,
		ISBN       : this.isbn, 
		sync		   : this.sync,
		highlights : this.highlights
	}
}

Book.prototype.getBook = async function() {
	return await this.searchForBook();
}

module.exports = Book;
