const path = require('path');
// const util = require('util');
// const fs = require('fs-extra');
const mongoose = require('mongoose');
const FormSchema = require('./app/mongoose-schema_defs').FormSchema;
const xlsxParser = require('./app/lib-xlsx_parser');
// const stringFormatter = require('./app/util-string_formatter');
const C = require('./app/config');

// stringFormatter.setLowerCaseWords(C.LOWER_CASE_WORDS);
// stringFormatter.setUpperCaseWords(C.UPPER_CASE_WORDS);

const FormModel = mongoose.model('Form', FormSchema);

const table = xlsxParser.parse(path.join(__dirname, 'app', 'data-forms.xlsx'), { rowStartIndex: 0 });

const formDocs = [];

let groupName;
let form;
let field;
table.data.forEach((rowObj, rowIndex) => {
  rowObj.forEach((cellString, colIndex) => {
    if (colIndex === 0 && cellString) {
      groupName = cellString;
    }
    if (colIndex === 1 && cellString) {
      form = { title: cellString, groupName, fields: [] };
      formDocs.push(form);
    }
    if (colIndex === 2 && cellString) {
      field = { label: cellString, isMulti: false, items: [] };
      form.fields.push(field);
    }
    if (colIndex === 3 && cellString) {
      if (cellString.substr(0, 1) === '[') {
        // console.log('HERE');
        field.isMulti = true;
        field.type = cellString.substr(1, cellString.length - 2).toUpperCase();
      } else {
        field.type = cellString;
      }
    }
    if (colIndex === 4 && cellString) {
      field.isMulti = true;
      field.items = cellString.split('|');
    }
  });
});

// console.log(util.inspect(formDocs, { depth: null }));

function insertFormDocs() {
  return FormModel.insertMany(formDocs).then((result) => {
    console.log(`INSERTED ${result.length} forms.`);
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
    removeModels([FormModel])
    .then(() => insertFormDocs())
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
