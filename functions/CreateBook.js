const Book = require('./Book.js');

/**
	* Using the provided book title and author(s)
	* Search using the Google Books API to download 
	* the book cover as well as the book volume identifier
	* and the ISBN
	* @param {String} title
	* @param {Array} authors
	* @returns {Promise<Object>}
	*/
function CreateBook(json) {
	const book = new Book(json).getDetails();

	// Do some error checking?
	return book;
}

module.exports = CreateBook;

