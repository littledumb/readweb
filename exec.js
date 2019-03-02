#!/usr/bin/env node

'use strict';

const readweb = require('.');

const url = process.argv[2];
const keepHref = process.argv.includes('--keepHref');
const paretoArg = process.argv.filter(a => a.startsWith('--paretoRatio=')).pop();
const paretoRatio = paretoArg ? parseFloat(paretoArg.substring('--paretoRatio='.length)) : 0.6;

readweb({url, paretoRatio, keepHref}).then(text => {
  console.log(text);
});
