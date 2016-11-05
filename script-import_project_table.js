const path = require('path');
// const util = require('util');
// const fs = require('fs-extra');
const mongoose = require('mongoose');
const ProjectSchema = require('./app/mongoose-schema_defs').ProjectSchema;
const xlsxParser = require('./app/lib-xlsx_parser');
// const stringFormatter = require('./app/util-string_formatter');
const C = require('./app/config');

// stringFormatter.setLowerCaseWords(C.LOWER_CASE_WORDS);
// stringFormatter.setUpperCaseWords(C.UPPER_CASE_WORDS);

const ProjectModel = mongoose.model('Project', ProjectSchema);

const table = xlsxParser.parse(path.join(__dirname, 'app', 'data-projects.xlsx'), { rowStartIndex: 0 });

const projectDocs = [];

// let groupName;
let project;
let fieldName;
table.data.forEach((rowObj, rowIndex) => {
  rowObj.forEach((cellString, colIndex) => {
    if (colIndex === 0 && cellString) {
      project = { name: cellString, subcontractors: [], startDate: '', endDate: '', nationCode: '', jurisdictionCodes: [] };
      projectDocs.push(project);
    }
    if (colIndex === 1 && cellString) {
      fieldName = cellString.toLowerCase();
    }
    if (colIndex === 2 && cellString) {
      if (fieldName === 'subcontractor') project.subcontractors.push(cellString);
      else if (fieldName === 'startdate') project.startDate = cellString;
      else if (fieldName === 'enddate') project.endDate = cellString;
      else if (fieldName === 'nation') project.nationCode = cellString;
      else if (fieldName === 'jurisdictions') project.jurisdictionCodes.push(cellString);
    }
  });
});

// console.log(util.inspect(projectDocs, { depth: null }));

function insertProjectDocs() {
  return ProjectModel.insertMany(projectDocs).then((result) => {
    console.log(`INSERTED ${result.length} projects.`);
    return result;
  });
  // return Promise.resolve();
}

function removeModels(arg) {
  if (!Array.isArray(arg)) {
    return arg.remove({}).then((result) => {
      console.log(`REMOVED ${result.result.n} documents from from '${arg.modelName}'`);
      return result;
    });
  }
  if (arg.length === 1) {
    return arg[0].remove({}).then((result) => {
      console.log(`REMOVED ${result.result.n} documents from '${arg[0].modelName}'`);
      return result;
    });
  }
  return Promise.all(arg.map((model) => {
    return model.remove({}).then((result) => {
      console.log(`REMOVED ${result.result.n} documents from '${arg.modelName}'`);
      return result;
    });
  }));
}

function start() {
  mongoose.Promise = global.Promise;
  mongoose.set('debug', false);
  mongoose.connect(C.DB_URI);

  const connection = mongoose.connection;
  connection.on('connected', () => {
    console.log('Connected to Mongo');
  });

  connection.on('disconnected', () => {
    console.log('Disconnected from Mongo');
  });

  connection.on('open', () => {
    console.log('Opened Mongo Database');
    removeModels([ProjectModel])
    .then(() => insertProjectDocs())
    .then(() => connection.close())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
  });

  process.on('SIGINT', () => {
    connection.close(() => {
      console.log('App termination signal received. Exiting process.');
      process.exit(0);
    });
  });
}

start();

// console.log(util.inspect(outcomeDocs, { depth: null }));
