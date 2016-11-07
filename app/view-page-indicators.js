const pageTitle = 'Indicators';
const nav = { id: 'indicators', name: 'Indicators' };
const query = '{outcomes {sectionCode title indicators {sectionCode title} outputs {sectionCode title indicators {sectionCode title}}}}';

const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');

const pageTemplate = handlebars.compile(fs.readFileSync(path.join('app', 'template-page-indicators.hbs'), { encoding: 'utf8' }));

function context(queryResults) {
  const full = pageTemplate(queryResults.data || {});
  return { full };
}

module.exports = { pageTitle, nav, query, context };
