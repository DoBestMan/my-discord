'use strict';

const bytenode = require('bytenode');
const fs = require('fs');
const v8 = require('v8');

v8.setFlagsFromString('--no-lazy');

if (!fs.existsSync('./src/main/main.jsc') && fs.existsSync('./src/main/main.js')) {
  bytenode.compileFile('./src/main/main.js');
  fs.unlinkSync('./src/main/main.js');
}

require('./src/main/main.jsc');
