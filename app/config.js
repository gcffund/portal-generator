const path = require('path');
const fs = require('fs-extra');

const UPPER_CASE_WORDS = ['gcf', 'gcff', 'mrv', 'redd', 'nfm', 'ss'];
const LOWER_CASE_WORDS = ['a', 'an', 'at', 'as', 'and', 'the', 'or', 'of', 'on', 'in', 'by', 'to', 'for', 'with'];

const DB_URI = 'mongodb://localhost:27017/gcffund-portal';

const GRAPHQL_PORT = 9090;
const GRAPHQL_BASE_URI = `http://127.0.0.1:${GRAPHQL_PORT}`;

const PUBLIC_DIR = '/var/www/gcffund-portal/public';

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

module.exports = {
  UPPER_CASE_WORDS,
  LOWER_CASE_WORDS,
  DB_URI,
  GRAPHQL_PORT,
  GRAPHQL_BASE_URI,
  PUBLIC_DIR,
  IS_PRODUCTION,
  NATIONS,
  JURISDICTIONS,
};
