# readweb

Use Pareto principle to read the main content of a web page; no need to analyze markups.

### Install

`npm i --save readweb`

The module installation process will automatically detect and install `PhantomJS` package, which is a headless browser toolkit. The package is self-contained for Windows and Mac OS X systems, however, for Linux system it relies on Fontconfig. Please refer to [the official document](http://phantomjs.org/download.html).

### Usage

Code Example:

```
const readweb = require('readweb');

readweb.read({url: 'https://a-web-page-url'}).then(txt => {
  console.log(txt);
});

readweb.close();
```

Options:

* `url`: (required) the web page url.
* `keepHref`: (optional, default `false`) if `true`, the returned text will keep links in the original content.
* `paretoRatio`: (optional, default 0.6) the pareto ratio, should be less than 1.0 but greater than 0.5.
* `selector`: (optional) a cheerio selector, if specified, pareto algorithm will be skipped.
* `keepMarkup`: (optional, dafault false) if `true`, will return html instead of plain text.

### Test

Use exec.js to test the module. Run

`node exec.js https://abc.com --keepHref --paretoRatio=0.7`
