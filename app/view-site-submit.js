const fs = require('fs-extra');
const handlebars = require('handlebars');

const siteFn = handlebars.compile(fs.readFileSync('./app/template-site-submit.hbs', { encoding: 'utf8' }));

function render(context) {
  return siteFn(context);
}

module.exports = { render };
