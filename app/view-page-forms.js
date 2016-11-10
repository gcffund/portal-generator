const pageTitle = 'Forms';
const nav = { id: 'forms', name: 'Forms' };
const query = '{ jurisdictions { code name fullName } forms { _id title groupName fields { label labelID type isMulti items isString isDate isNumber isInteger isPerson isJurisdiction isChoice } } }';

const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');

const mainTemplate = handlebars.compile(fs.readFileSync(path.join('app', 'view-page-forms.hbs'), { encoding: 'utf8' }));
const sideTemplate = handlebars.compile(fs.readFileSync(path.join('app', 'view-page-forms-side.hbs'), { encoding: 'utf8' }));

function context(queryResults) {
  const main = mainTemplate(queryResults.data || {});
  const side = sideTemplate(queryResults.data || {});
  return { main, side };
}

module.exports = { pageTitle, nav, query, context };
