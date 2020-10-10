# readweb

Use Pareto principle to read the main content of a web page; no need to analyze markups.

### Install

`npm i readweb`

### Usage

```
const readweb = require('readweb');

readweb('https://en.wikipedia.org/wiki/Wikipedia', {
  paretoRatio: 0.7,
  fetchOptions: {
    proxy: 'http://127.0.0.1:10000'
  },
  toTextOptions: {
    ignoreImage: true,
    ignoreHref: true
  }
})
.then(txt => {
  console.log(txt);
});
```

#### Options:

* `selector` a cheerio selector, if specified, pareto algorithm will be skipped
* `paretoRatio` should be less than `1.0` but greater than `0.5`. Default: `0.6`
* `toText` whether convert the content to plain text. Default: `true`
* `fetchOptions` options fed to `fetch`. See [make-fetch-happen](https://www.npmjs.com/package/make-fetch-happen)
* `toTextOptions` options fed to `html-to-text`. See [html-to-text](https://www.npmjs.com/package/html-to-text)
