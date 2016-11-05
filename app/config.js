const path = require('path');
const fs = require('fs-extra');

const UPPER_CASE_WORDS = ['gcf', 'gcff', 'mrv', 'redd', 'nfm', 'ss'];
const LOWER_CASE_WORDS = ['a', 'an', 'and', 'the', 'as', 'or', 'of', 'on', 'in', 'by', 'to', 'for', 'with'];
// const PAGE_NAMES = ['Home', 'About', 'Feedback', 'Nation Page', 'State Overview', 'Carbon Accounting', 'REDD Implementation', 'Financing', 'Audits And Reviews'];
const DB_URI = 'mongodb://localhost:27017/gcffund-portal';

const IS_PRODUCTION = false;

const NATIONS = fs.readJsonSync(path.join('app', 'data.nations.json'));
// build jurisdictions from nations
const JURISDICTIONS = [];
NATIONS.forEach((nation) => {
  if (!nation.jurisdictions) return;
  nation.jurisdictions.forEach((jurisdiction) => {
    JURISDICTIONS.push(jurisdiction);
  });
});

module.exports = { UPPER_CASE_WORDS, LOWER_CASE_WORDS, DB_URI, IS_PRODUCTION, NATIONS, JURISDICTIONS };
