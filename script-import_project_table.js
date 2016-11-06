const path = require('path');
const uuid = require('uuid');
const mongoose = require('mongoose');
const ProjectSchema = require('./app/schema-mongoose').ProjectSchema;
const xlsxParser = require('./app/lib-xlsx_parser');
const C = require('./app/config');

const ProjectModel = mongoose.model('Project', ProjectSchema);

const table = xlsxParser.parse(path.join(__dirname, 'app', 'data-projects.xlsx'), { rowStartIndex: 0 });

const projectDocs = [];

let project;
let fieldName;
table.data.forEach((rowObj) => {
  rowObj.forEach((cellString, colIndex) => {
    if (colIndex === 0 && cellString) {
      project = {
        _uuid: uuid.v1(),
        name: cellString,
        subcontractors: [],
        startDate: '',
        endDate: '',
        nationCode: '',
        jurisdictionCodes: [],
        indicators: [],
      };
      projectDocs.push(project);
    }
    if (colIndex === 1 && cellString) {
      fieldName = cellString.toLowerCase();
    }
    if (colIndex === 2 && cellString) {
      if (fieldName === 'subcontractor') project.subcontractors.push(cellString);
      else if (fieldName === 'id') project._id = cellString; // overrides the default random UUID
      else if (fieldName === 'startdate') project.startDate = cellString;
      else if (fieldName === 'enddate') project.endDate = cellString;
      else if (fieldName === 'nation') project.nationCode = cellString;
      else if (fieldName === 'jurisdictions') project.jurisdictionCodes.push(cellString);
      else if (fieldName === 'indicators') project.indicators.push(cellString);
    }
  });
});

function insertProjectDocs() {
  return ProjectModel.insertMany(projectDocs).then((result) => {
    console.log(`INSERTED ${result.length} projects.`);
    return result;
  });
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
