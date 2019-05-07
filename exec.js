#!/usr/bin/env node

'use strict';

const readweb = require('.');

const url = process.argv[2];
const selectorArg = process.argv.filter(a => a.startsWith('--selector=')).pop();
const selector = selectorArg ? selectorArg.substring('--selector='.length) : null;
const keepHref = process.argv.includes('--keepHref');
const paretoArg = process.argv.filter(a => a.startsWith('--paretoRatio=')).pop();
const paretoRatio = paretoArg ? parseFloat(paretoArg.substring('--paretoRatio='.length)) : 0.6;
const keepMarkup = process.argv.includes('--keepMarkup');
const usePhantom = process.argv.includes('--usePhantom');

const exec = async () => {
  const content = await readweb.read(url, {selector, paretoRatio, keepHref, keepMarkup, usePhantom});
  console.log(content);
};

exec();
