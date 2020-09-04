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
async function CreateBook(json) {
	const newBookBinder = new Book(json)
	const book = await newBookBinder.getDetails();

	// Do some error checking?

	return book;
}

module.exports = CreateBook;

