const pageTitle = 'Projects';
const nav = { id: 'projects', name: 'Projects' };
const query = '{ projects { _id name subcontractors startDate endDate nation { code name } jurisdictions {code name fullName } indicators { sectionCode title } forms { _id title } } }';

const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');

handlebars.registerHelper('counter', index => (index + 1));

const mainTemplate = handlebars.compile(fs.readFileSync(path.join('app', 'template-page-projects.hbs'), { encoding: 'utf8' }));
const sideTemplate = handlebars.compile(fs.readFileSync(path.join('app', 'template-page-projects-side.hbs'), { encoding: 'utf8' }));

function context(queryResults) {
  const main = mainTemplate(queryResults.data || {});
  const side = sideTemplate(queryResults.data || {});
  return { main, side };
}

module.exports = { pageTitle, nav, query, context };
