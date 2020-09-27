// The module use to create a book record for new books 
const Book = require('./Book.js');

/**
 * Gather additional attributes from around the internet using the JSON 
 * object representing a Kindle or Audible book. Rejects
 * @param {Buffer|Stream|String} source
 * @returns {Promise<Object>}
 */
function bindBook(json) {
  return bind(json)
}

/**
 * @param {String} contents - HTML attachment content
 * @returns {Object}
 */
function bind(json) {
  const book = new Book(json);

	if (book.valid()) {
		return book.getBook();
	}

	//return new Error(
		//"Invalid mail content. Expected an HTML attachment with Kindle notes."
	//);
}

module.exports = bindBook;
