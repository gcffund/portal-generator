const pageTitle = 'Indicators';
const nav = { id: 'indicators', name: 'Indicators' };
const query = '{outcomes {index section title indicators {index section title} outputs {index section title indicators {index section title}}}}';

const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');

const pageTemplate = handlebars.compile(fs.readFileSync(path.join('app', 'template-page-indicators.hbs'), { encoding: 'utf8' }));

function context(queryResults) {
  const full = pageTemplate(queryResults.data || {});
  return { full };
}

module.exports = { pageTitle, nav, query, context };
