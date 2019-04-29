'use strict';

const createPhantomPool = require('phantom-pool');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');

const pool = createPhantomPool({
  maxUses: 0,
  phantomArgs: [[
    '--ignore-ssl-errors=yes', '--ssl-protocol=any', '--load-images=no'
  ]]
});

const close = () => {
  pool.drain().then(() => pool.clear());
};

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

/**
 * Reads a web page, find the major element and returns its text content.
 *
 * @param {Object} options:
      - url {string} the given web page url, required
      - paretoRatio {number} should be less than 1.0 but greater than 0.5, default 06
      - keepHref {boolean} whether to keep links in the content, default false
      - selector {string} an cheerio DOM selector
      - keepMarkup {boolean} whether to return html or plain text, default false
 *
 * @returns {Promise} Promise object representing text of the main content
 */
const read = ({url, paretoRatio, keepHref, selector, keepMarkup, closePool} = {}) => {
  return new Promise((resolve, reject) => {
    // let _ph = null;
    let _page = null;
    let _status = null;

    return pool.use(async instance => {
      return instance.createPage();
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
      _page.close().then();

      if (_status >= 400) {
        reject(new Error(content));
      }

      const $ = cheerio.load(content);
      const html = selector ? $(selector).html() : $(pareto($, $('body'), paretoRatio || 0.6)).html();

      if (keepMarkup) {
        resolve(html);
      }

      const text = htmlToText.fromString(html, {
        ignoreHref: !keepHref,
        wordwrap: false,
        singleNewLineParagraphs: true
      }).replace(/\n\s*\n/g, '\n').replace(/\n/g, '\n\n');

      resolve(text);
    })
    .catch(error => {
      if (_page) {
        _page.close().then();
      }

      reject(error);
    });
  });
};

module.exports = {read, close};
