#!/usr/bin/env node
// Parse and syntax-check every inline <script> in one or more HTML files.
const fs = require('fs');
const vm = require('vm');

let failed = false;
const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node tools/qa/check-inline.js <file.html> [...]');
  process.exit(1);
}
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map(m => m[1])
    .filter(code => code.trim());
  if (!scripts.length) {
    console.log(file + ': no inline scripts');
    continue;
  }
  scripts.forEach((code, i) => {
    try {
      new vm.Script(code, { filename: file + '#script' + i });
      console.log(file + ': script ' + i + ' OK (' + code.length + ' chars)');
    } catch (err) {
      failed = true;
      console.error(file + ': script ' + i + ' FAILED: ' + err.message);
      process.exitCode = 1;
    }
  });
}
if (failed) process.exit(1);
