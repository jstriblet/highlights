const cheerio = require("cheerio");

/**
 * Convert email HTML into JSON
 * @param {String} html
 * @returns {Object}
 */
const Converter = function(html) {
  this.html = html;
  this.$ = cheerio.load(this.html);
	this.kindle = false;
	this.audible = false;
};

/**
 * Determine whether the given HTML is a valid Kindle notes export or an Audible audio book
 * @returns {Boolean}
 */
Converter.prototype.valid = function() {

  if (this.html) 
	{
    const notes = this.$(".noteText");
		const audibleIdx = this.html.split(' ').indexOf('Audible');

		if (notes.length > 0) 
		{
			this.kindle = true;
			return notes.length > 0;
		} 
		else if (audibleIdx > 0) 
		{
			this.audible = true;
			return audibleIdx > 0;
		}
  }
  return false;
};

/**
 * Parse the HTML to pull out the volume's title, author, and, if applicable, highlights
 * @returns {Object}
 */
Converter.prototype.getJSON = function() {
	if (this.kindle) 
	{
		const titleEl = this.$(".bookTitle");
		const authorEl = this.$(".authors");
		const title = titleEl.text().trim();
		const authors = authorEl
			.text()
			.split(";")
			.map(s => s.trim());

		return {
			volume: {
				title: title,
				authors: authors
			},
			medium: 'Kindle',
			sync: new Date().toLocaleString(),
			highlights: this.highlights()
		};
	}
	else if (this.audible)
	{
		const text = this.html
			.split('Audible app')[0]
			.split('Hi -')[1];
		const titleAndAuthor = text
			.split('% through')[1]
			.split(', narrated by')[0];
		const lastIdx = titleAndAuthor
			.split(' ')
			.lastIndexOf('by');
		const title = titleAndAuthor
			.split(' ')
			.slice(1,lastIdx)
			.join(' ');
		const authors = titleAndAuthor
			.split(' ')
			.slice(lastIdx+1)
			.join(' ')
			.split(',');
		const narrators = text
			.split('narrated by ')[1]
			.split(' on my')[0].split(',');

		return {
			volume: {
				title: title,
				authors: authors
			},
			medium: 'Audible',
			sync: new Date().toLocaleString()
		};
	}

	return { volume : {
		title: none
	}};

};

/**
 * Parse the highlights and notes from the HTML
 * @returns {Array} highlights
 */
Converter.prototype.highlights = function() {
  const headings = this.$(".noteHeading");
  let highlights = [];

  headings.each((index, el) => {
    const heading = cheerio(el);
    const color = heading
      .find("span[class^='highlight_']")
      .text()
      .trim();
    const text = heading.text().trim();

    const location = text.match(/location\s(\d*)/i);

    if (location) {
      if (text.match(/^Note -/i)) {
        // We're making the assumption that notes are only added on top of
        // a highlight. When that's the case, the exported file will include
        // the note directly after the text it's added on.
        if (highlights.length) {
          const highlight = highlights[highlights.length - 1];
          highlight.notes = this.highlightContent(location[1], color, el);
        }
      } else {
        highlights = highlights.concat(
          this.highlightContent(location[1], color, el)
        );
      }
    }
  });

  return highlights;
};

/**
 * Find the next note text after the given element
 * @param  {String} location - The highlight location
 * @param  {String} color
 * @param  {Node} el
 * @return {Array} The parsed highlight objects
 */
Converter.prototype.highlightContent = function(location, color, el) {
  let highlights = [];
  const nextEl = cheerio(el).next();

  if (nextEl.hasClass("noteText")) {
    const highlight = {
      color: color,
      content: cheerio(nextEl)
        .text()
        .trim(),
      location: location
    };

    highlights.push(highlight);

    if (nextEl.next().hasClass("noteText"))
      highlights = highlights.concat(
        this.highlightContent(location, color, nextEl)
      );
  }

  return highlights;
};


module.exports = Converter;
