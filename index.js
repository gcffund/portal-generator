const path = require('path');
const fs = require('fs-extra');
const request = require('request');
const C = require('./app/config');
const site = require('./app/view-site');

const pages = [];
pages.push(require('./app/view-page-home'));
pages.push(require('./app/view-page-indicators'));
pages.push(require('./app/view-page-forms'));
pages.push(require('./app/view-page-projects'));
pages.push(require('./app/view-page-submissions'));

const navItems = pages.map(page => page.nav);

// console.log(navItems);

function processPage(page) {
  if (!page.query) {
    return Promise.resolve({});
  }
  return new Promise((resolve, reject) => {
    request(`${C.GRAPHQL_BASE_URI}/?query=${page.query}`, (err, res, body) => {
      if (err) {
        return reject(err);
      } else if (res.statusCode !== 200) {
        // graphql will return a 400 with error messages in JSON parsable body
        return reject(new Error(`received statusCode '${res.statusCode}' from server with body '${body}'.`));
      }
      const data = JSON.parse(body);
      return resolve(data);
    });
  });
}

function cleanPublicDir() {
  if (!C.PUBLIC_DIR) return;
  // all files and directores
  let files = fs.readdirSync(C.PUBLIC_DIR);
  // filter out non directores
  files = files.filter(file => fs.statSync(path.join(C.PUBLIC_DIR, file)).isDirectory());
  // filter out the assets directory (if specified)
  if (C.PUBLIC_ASSETS_DIR) {
    const assetsDirBasename = path.basename(C.PUBLIC_ASSETS_DIR);
    files = files.filter(file => (file !== assetsDirBasename));
  }
  // what remains are statically-generated directores to be removed
  files.forEach((file) => {
    fs.removeSync(path.join(C.PUBLIC_DIR, file));
  });
}

function processPages() {
  const p = [];
  pages.forEach((page) => {
    const navBaseName = page.nav.id || '';
    const pageDirName = path.join(C.PUBLIC_DIR, navBaseName);
    fs.ensureDirSync(pageDirName);
    p.push(
      processPage(page)
      .then((result) => {
        fs.writeFileSync(
          path.join(pageDirName, 'index.html'),
          site.render({ pageContext: page.context(result), navItems })
        );
        return result;
      })
      .catch((err) => {
        console.log(err);
      })
    );
  });
}

cleanPublicDir();
processPages();
