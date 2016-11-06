const path = require('path');
// const util = require('util');
// const fs = require('fs-extra');
const mongoose = require('mongoose');
const OutcomeSchema = require('./app/schema-mongoose').OutcomeSchema;
const xlsxParser = require('./app/lib-xlsx_parser');
const stringFormatter = require('./app/lib-string_formatter');
const C = require('./app/config');

const sectionNumberRegex = / .+$/;

stringFormatter.setLowerCaseWords(C.LOWER_CASE_WORDS);
stringFormatter.setUpperCaseWords(C.UPPER_CASE_WORDS);

// const OutcomeSchema = schemaDefs.outcomeSchema;
const OutcomeModel = mongoose.model('Outcome', OutcomeSchema);

const table = xlsxParser.parse(path.join(__dirname, 'app', 'data-framework.xlsx'), { rowStartIndex: 2 });

const outcomeDocs = [];

let isOutcome = false;
let activeOutcome;
let activeOutput;
table.data.forEach((rowObj, rowIndex) => {
  rowObj.forEach((cellString, colIndex) => {
    if (colIndex === 0 && cellString) { // this is an outcome/output section ID
      const sectionNumberMatch = sectionNumberRegex.exec(cellString);
      if (!sectionNumberMatch) {
        console.log(`ERROR: cell (${rowIndex}, ${colIndex}) "${cellString}" doesn't follow section format pattern.`);
        return;
      }
      isOutcome = (cellString.substr(0, sectionNumberMatch.index).trim().toUpperCase() === 'OUTCOME');
      if (isOutcome) {
        activeOutcome = { index: 0, title: '', indicators: [], outputs: [] };
        outcomeDocs.push(activeOutcome);
        activeOutcome.index = outcomeDocs.length - 1;
      } else {
        activeOutput = { index: 0, title: '', indicators: [] };
        activeOutcome.outputs.push(activeOutput);
        activeOutput.index = activeOutcome.outputs.length - 1;
      }
    } else if (colIndex === 1 && cellString) { // descriptive title for outcome/output
      if (isOutcome) {
        activeOutcome.title = stringFormatter.getStartCase(cellString);
      } else {
        activeOutput.title = stringFormatter.getStartCase(cellString);
      }
      // console.log(stringFormatter.getStartCase(cellString));
    } else if (colIndex === 2) { // this is an indicator of the outcome
      if (isOutcome) {
        activeOutcome.indicators.push({ index: activeOutcome.indicators.length, title: stringFormatter.getStartCase(cellString) });
      } else {
        activeOutput.indicators.push({ index: activeOutput.indicators.length, title: stringFormatter.getStartCase(cellString) });
      }
    } else if (colIndex === 3) { // this is list of form indexes for the indicator
    } else if (colIndex === 5) { // this is the means for verification for the indicator
    }
  });
});

function insertOutomeDocs() {
  return OutcomeModel.insertMany(outcomeDocs).then((result) => {
    console.log(`INSERTED ${result.length} outcomes.`);
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
    removeModels([OutcomeModel])
    .then(() => insertOutomeDocs())
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
