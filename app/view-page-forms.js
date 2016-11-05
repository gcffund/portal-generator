const pageTitle = 'Forms';
const nav = { id: 'forms', name: 'Forms' };
const query = '{ forms { title groupName fields { label type isMulti items isString isDate isNumber isName isChoice } } }';

const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');

const pageTemplate = handlebars.compile(fs.readFileSync(path.join('app', 'template-page-forms.hbs'), { encoding: 'utf8' }));

function context(queryResults) {
  const main = pageTemplate(queryResults.data || {});
  const side = 'SIDE';
  return { main, side };
}

module.exports = { pageTitle, nav, query, context };
