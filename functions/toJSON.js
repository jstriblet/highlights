const Converter = require('./Converter.js');
/**
 * Convert a Kindle notes email export into a JSON object. Rejects
 * if the mail isn't a valid Kindle notes export. The email is
 * expected to contain at least one HTML attachment.
 * @param {Buffer|Stream|String} source
 * @returns {Promise<Object>}
 */
function toJSON(source) {
  return convert(source)}

/**
 * @param {String} contents - HTML attachment content
 * @returns {Object}
 */
function convert(contents) {
  const converter = new Converter(contents);

  if (converter.valid()) {
		console.log(converter.getJSON());
    return converter.getJSON();
  }

  return new Error(
    "Invalid mail content. Expected an HTML attachment with Kindle notes."
  );
}

module.exports = toJSON;
