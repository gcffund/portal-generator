const fs = require('fs-extra');
const handlebars = require('handlebars');

const siteFn = handlebars.compile(fs.readFileSync('./app/view-site-admin.hbs', { encoding: 'utf8' }));
const navFn = handlebars.compile(fs.readFileSync('./app/template-site-nav.hbs', { encoding: 'utf8' }));

function render(context) {
  return siteFn({ pageContext: context.pageContext, nav: navFn({ navItems: context.navItems }) });
}

module.exports = { render };
