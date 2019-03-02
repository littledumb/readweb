'use strict';

const phantom = require('phantom');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');

// Use Pareto's principle to find the main element
const pareto = ($, el, r) => {
  const len = $(el).text().length;
  let candidate = el;
  $(el).children().each((i, child) => {
    if ($(child).text().length >= r * len) {
      candidate = pareto($, child, r);
    }
  });
  return candidate;
};

const closePhantom = (ph, page) => {
  if (page) {
    page.close();
  }

  if (ph) {
    ph.exit();
  }
};

/**
 * Reads a web page, find the major element and returns its text content.
 *
 * @param {Object} options:
      - url {string} the given web page url, required
      - paretoRatio {number} should be less than 1.0 but greater than 0.5, default 06
      - keepHref {boolean} whether to keep links in the content, default false
 *
 * @returns {Promise} Promise object representing text of the main content
 */
module.exports = ({url, paretoRatio, keepHref} = {}) => {
  return new Promise((resolve, reject) => {
    let _ph = null;
    let _page = null;
    let _status = null;
    return phantom
      .create()
      .then(ph => {
        _ph = ph;
        return _ph.createPage();
      })
      .then(page => {
        _page = page;
        return page.open(url);
      })
      .then(status => {
        _status = status;
        return _page.property('content');
      })
      .then(content => {
        closePhantom(_ph, _page);

        if (_status >= 400) {
          reject(new Error(content));
        }

        const $ = cheerio.load(content);
        const html = $(pareto($, $('body'), paretoRatio || 0.6)).html();
        const text = htmlToText.fromString(html, {
          ignoreHref: !keepHref,
          singleNewLineParagraphs: true
        }).replace(/\n\s*\n/g, '\n').replace(/\n/g, '\n\n');

        resolve(text);
      })
      .catch(error => {
        closePhantom(_ph, _page);
        reject(error);
      });
  });
};
