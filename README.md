# readweb

Use Pareto principle to read the main content of a web page; no need to analyze markups.

### Install

`npm i --save readweb`

The module installation process will automatically detect and install `PhantomJS` package, which is a headless browser toolkit. The package is self-contained for Windows and Mac OS X systems, however, for Linux system it relies on Fontconfig. Please refer to [the official document](http://phantomjs.org/download.html).

The module has two ways to read the web page: using `request-promise` or `PhantomJS`. By default, the module uses `request-promise` to get the content of the web page, then uses `chardet` and `iconv-lite` to determine the encoding and convert the content if necessary. If the detection fails, the module falls back on using PhantomJS.

### Usage

Code Example:

```
const readweb = require('readweb');

readweb.read(url, options).then(txt => {
  console.log(txt);
});
```

Parameters:
* `url`: (required) the web page url.
* `options`: (optional) options for processing the content
  * `selector`: (optional) a cheerio selector, if specified, pareto algorithm will be skipped.
  * `keepHref`: (optional, default `false`) if `true`, the returned text will keep links in the original content.
  * `paretoRatio`: (optional, default 0.6) the pareto ratio, should be less than 1.0 but greater than 0.5.
  * `keepMarkup`: (optional, dafault false) if `true`, will return html instead of plain text.
  * `ignoreImage`: (optional, default false) if `true`, ignore all images
  * `usePhantom`: (optional, default false) if `true`, will use `PhantomJS` to read the web page.

### Test

Use exec.js to test the module. Run

`node exec.js https://abc.com --keepHref --paretoRatio=0.7`
