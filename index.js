'use strict';

const nodeFetch = require('node-fetch');
const fetch = require('fetch-cookie/node-fetch')(nodeFetch);

const cheerio = require('cheerio');
const { convert } = require('html-to-text');

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

const decode = html => {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return html.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#x([0-9A-F]+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 16);
        return String.fromCharCode(num);
    });
};

/**
 * Reads a web page, find the major element and returns its content.
 *
 * @param {string} url, the web page url, required
 * @param {Object} options, optional:
      - selector {string} an cheerio DOM selector; if it's given, paretoRatio is ignored
      - tags {[string]} filter html elements, e.g. ['p', 'h1', 'h2']
      - paretoRatio {number} should be less than 1.0 but greater than 0.5, default 0.6
      - toText {boolean} whether convert the content to plain text, default true
      - fetchOptions {Object} options fed to fetch (see [make-fetch-happen](https://www.npmjs.com/package/make-fetch-happen))
      - toTextOptions {Object} options fed to html-to-text (see [html-to-text](https://www.npmjs.com/package/html-to-text))
 *
 * @returns {Promise} Promise object representing text of the main content
 */
const read = (url, { selector, tags, paretoRatio = 0.6, toText = true, fetchOptions = {}, toTextOptions = {} } = {}) => {
  return fetch(url, fetchOptions)
  .then(res => res.text())
  .then(body => {
    const $ = cheerio.load(body);
    const main = selector ? $(selector) : $(pareto($, $('body'), paretoRatio));
    const html = Array.isArray(tags) && tags.length > 0 ?
      $(main).children().map((i, ele) => {
        if (ele.type === 'tag' && tags.includes(ele.name)) {
          return $.html(ele);
        }

        return '';
      }).get().join('') : $(main).html();

    if (!toText) {
      return decode(html);
    }

    return convert(html, toTextOptions);
  });
};

module.exports = read;
