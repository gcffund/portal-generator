const pageTitle = 'Submissions';
const nav = { id: 'submissions', name: 'Submissions' };
const query = '{ projects { name subcontractors startDate endDate } }';

const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');

// const pageTemplate = handlebars.compile(fs.readFileSync(path.join('app', 'template-page-projects.hbs'), { encoding: 'utf8' }));

function context(queryResults) {
  // const main = pageTemplate(queryResults.data || {});
  const main = 'MAIN';
  const side = 'SIDE';
  return { main, side };
}

module.exports = { pageTitle, nav, query, context };
