'use strict';

const request = require('request-promise');
const phantom = require('phantom');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');
const chardet = require('chardet');
const iconv = require('iconv-lite');

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

const closePhantom = async (ph, page) => {
  if (page) {
    await page.close();
  }

  if (ph) {
    ph.exit();
  }
};

const readWithPhantom = (url, callback) => {
  return new Promise((resolve, reject) => {
    let _ph = null;
    let _page = null;
    let _status = null;
    return phantom.create().then(ph => {
      _ph = ph;
      return _ph.createPage();
    }).then(page => {
      _page = page;
      return page.open(url);
    }).then(status => {
      _status = status;
      return _page.property('content');
    }).then(content => {
      closePhantom(_ph, _page);

      if (_status >= 400) {
        reject(new Error(content));
      }

      resolve(callback(content));
    }).catch(error => {
      closePhantom(_ph, _page);
      reject(error);
    });
  });
};

const readWithRequest = (url, callback) => {
  return new Promise((resolve, reject) => {
    return request({
      url,
      method: 'GET',
      encoding: null // Must set to null, otherwise request will use its default encoding
    }).then(content => {
      const encoding = chardet.detectAll(content);
      if (encoding[0].confidence < 50 || !iconv.encodingExists(encoding[0].name)) {
        // Fall back to using PhantomJS
        return readWithPhantom(url, callback);
      }

      resolve(callback(iconv.decode(content, encoding[0].name)));
    }).catch(error => {
      reject(error);
    });
  });
};

/**
 * Reads a web page, find the major element and returns its text content.
 *
 * @param {string} url, the web page url, required
 * @param {Object} options, optional:
      - selector {string} an cheerio DOM selector; if it's given, paretoRatio is ignored
      - paretoRatio {number} should be less than 1.0 but greater than 0.5, default 0.6
      - keepHref {boolean} whether to keep links in the content, default false
      - keepMarkup {boolean} whether to return html or plain text, default false
      - usePhantom {boolean} whether to use PhantomJS to read the page, default false
 *
 * @returns {Promise} Promise object representing text of the main content
 */
const read = (url, {selector, paretoRatio = 0.6, keepHref = false, keepMarkup = false, usePhantom = false} = {}) => {
  const callback = content => {
    const $ = cheerio.load(content);
    const html = selector ? $(selector).html() : $(pareto($, $('body'), paretoRatio)).html();

    if (keepMarkup) {
      return html;
    }

    return htmlToText.fromString(html, {
      ignoreHref: !keepHref,
      wordwrap: false,
      singleNewLineParagraphs: true
    }).replace(/\n\s*\n/g, '\n').replace(/\n/g, '\n\n');
  };

  return usePhantom ? readWithPhantom(url, callback) : readWithRequest(url, callback);
};

module.exports = {read};
