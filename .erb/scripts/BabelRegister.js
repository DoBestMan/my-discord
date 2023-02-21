const path = require('path');

require('@babel/register')({
  extensions: ['.es6', '.es', '.jsx', '.js', 'jsc', '.mjs', '.ts', '.tsx'],
  cwd: path.join(__dirname, '..', '..'),
});
