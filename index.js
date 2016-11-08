const path = require('path');
const fs = require('fs-extra');
const request = require('request');
const C = require('./app/config');
const adminSite = require('./app/view-site-admin');
const submitSite = require('./app/view-site-submit');

const adminSitePages = [];
adminSitePages.push(require('./app/view-page-home'));
adminSitePages.push(require('./app/view-page-indicators'));
adminSitePages.push(require('./app/view-page-forms'));
adminSitePages.push(require('./app/view-page-projects'));
adminSitePages.push(require('./app/view-page-submissions'));

function processQuery(query) {
  if (!query) {
    return Promise.resolve({});
  }
  return new Promise((resolve, reject) => {
    request(`${C.GRAPHQL_BASE_URI}/?query=${query}`, (err, res, body) => {
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

function cleanDir(baseDir, assetsDir) {
  if (!baseDir) return;
  // all files and directores
  let files = fs.readdirSync(baseDir);
  // filter out non directores
  files = files.filter(file => fs.statSync(path.join(baseDir, file)).isDirectory());
  // filter out the assets directory (if specified)
  if (assetsDir) {
    const assetsDirBasename = path.basename(assetsDir);
    files = files.filter(file => (file !== assetsDirBasename));
  }
  // what remains are statically-generated directores to be removed
  files.forEach((file) => {
    fs.removeSync(path.join(baseDir, file));
  });
}

function processPages(publicDir, site, pages) {
  const navItems = pages.map(page => page.nav);
  const p = [];
  pages.forEach((page) => {
    const navBaseName = page.nav.id || '';
    const pageDirName = path.join(publicDir, navBaseName);
    fs.ensureDirSync(pageDirName);
    p.push(
      processQuery(page.query || '')
      .then((result) => {
        fs.writeFileSync(
          path.join(pageDirName, 'index.html'),
          site.render({ pageContext: page.context(result), navItems })
        );
        console.log(`Processed ${pageDirName}`);
        return result;
      })
      .catch((err) => {
        console.log(err);
      })
    );
  });
  return Promise.all(p);
}

function buildSubmitPages() {
  const baseDir = path.join(C.PUBLIC_DIR, 'submit');
  fs.ensureDirSync(baseDir);
  const query = '{ projects { _id name subcontractors startDate endDate nation { code name } jurisdictions {code name fullName } indicators { sectionCode title } forms { _id title } } }';
  processQuery(query)
  .then((result) => {
    if (!result.data && !result.data.projects) return Promise.reject();
    // const pages = [];
    result.data.projects.forEach((project) => {
      const pageDir = path.join(baseDir, project._id);
      fs.ensureDirSync(pageDir);
      fs.writeFileSync(
        path.join(pageDir, 'index.html'),
        submitSite.render(project)
      );
      // console.log(project._id);
    });
    return Promise.resolve();
  });
}

cleanDir(C.PUBLIC_DIR, C.PUBLIC_ASSETS_DIR);
processPages(C.PUBLIC_DIR, adminSite, adminSitePages)
.then(() => {
  buildSubmitPages();
});
