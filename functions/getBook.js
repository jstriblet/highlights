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
function getBook(title, authors) {
  return get(title, authors);
}

/**
 * @param {String} contents - HTML attachment content
 * @returns {Object}
 */
function get(title, authors) {
  const book = new Book(title, authors);

	// Do some error checking?

	return book.getDetails();
}

module.exports = getBook;

