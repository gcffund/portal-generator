const path = require('path');
const uuid = require('uuid');
const _ = require('lodash');
// const util = require('util');
const mongoose = require('mongoose');
const FormSchema = require('./app/schema-mongoose').FormSchema;
const IndicatorSchema = require('./app/schema-mongoose').IndicatorSchema;
const OutcomeSchema = require('./app/schema-mongoose').OutcomeSchema;
const xlsxParser = require('./app/lib-xlsx_parser');
const stringFormatter = require('./app/lib-string_formatter');
const C = require('./app/config');

const sectionNumberRegex = / .+$/;

stringFormatter.setLowerCaseWords(C.LOWER_CASE_WORDS);
stringFormatter.setUpperCaseWords(C.UPPER_CASE_WORDS);

const FormModel = mongoose.model('Form', FormSchema);
const IndicatorModel = mongoose.model('Indicator', IndicatorSchema);
const OutcomeModel = mongoose.model('Outcome', OutcomeSchema);

const table = xlsxParser.parse(path.join(__dirname, 'app', 'data-framework.xlsx'), { rowStartIndex: 2 });

let formDocs;
const indicatorDocs = [];
const outcomeDocs = [];

function getAlphabeticIndex(integerIndex) {
  const base26 = integerIndex.toString(26);
  let alphabeticIndex = '';
  base26.split('').forEach((char, charIndex) => {
    let charCode = char.charCodeAt();
    if (charIndex === 0 && base26.length !== 1) charCode -= 1;
    charCode = (char <= '9') ? charCode + 49 : charCode + 10;
    alphabeticIndex += String.fromCharCode(charCode);
  });
  return alphabeticIndex;
}

function readFormDocs() {
  return FormModel.find({});
}

let isOutcome = false;
let activeOutcome;
let activeOutput;
let indicatorIndex;
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
        activeOutcome = { sectionCode: '', title: '', indicators: [], outputs: [] };
        outcomeDocs.push(activeOutcome);
        activeOutcome.sectionCode = (outcomeDocs.length).toString(10);
      } else {
        activeOutput = { sectionCode: '', title: '', indicators: [] };
        activeOutcome.outputs.push(activeOutput);
        activeOutput.sectionCode = `${activeOutcome.sectionCode}.${(activeOutcome.outputs.length).toString(10)}`;
      }
      indicatorIndex = 0;
    } else if (colIndex === 1 && cellString) { // descriptive title for outcome/output
      if (isOutcome) {
        activeOutcome.title = stringFormatter.getStartCase(cellString);
      } else {
        activeOutput.title = stringFormatter.getStartCase(cellString);
      }
    } else if (colIndex === 2) { // this is an indicator of the outcome (or output)
      const indicatorID = uuid.v1();
      indicatorDocs.push({ _id: indicatorID,
        sectionCode: '',
        title: stringFormatter.getStartCase(cellString),
        formName: '',
        forms: [],
      });
      if (isOutcome) {
        activeOutcome.indicators.push(indicatorID);
        indicatorDocs[indicatorDocs.length - 1].sectionCode = `${activeOutcome.sectionCode} ${getAlphabeticIndex(indicatorIndex)}`;
      } else {
        activeOutput.indicators.push(indicatorID);
        indicatorDocs[indicatorDocs.length - 1].sectionCode = `${activeOutput.sectionCode} ${getAlphabeticIndex(indicatorIndex)}`;
      }
      indicatorIndex += 1;
    } else if (colIndex === 3) { // this is list of form indexes for the indicator
    } else if (colIndex === 5) { // this is the means for verification for the indicator
    } else if (colIndex === 6) { // this is the form name
      indicatorDocs[indicatorDocs.length - 1].formName = cellString;
    }
  });
});

function insertOutomeDocs() {
  return OutcomeModel.insertMany(outcomeDocs).then((result) => {
    console.log(`INSERTED ${result.length} outcomes.`);
    return result;
  });
}

function insertIndicatorDocs() {
  const formLookupID = {};
  formDocs.forEach((doc) => { formLookupID[_.snakeCase(doc.title)] = doc._id; });
  // populate indicator 'forms' with formIDs
  indicatorDocs.forEach((indicatorDoc) => {
    if (!indicatorDoc.formName) return;
    const formID = formLookupID[_.snakeCase(indicatorDoc.formName)];
    if (!formID) return;
    indicatorDoc.forms.push(formID);
  });
  return IndicatorModel.insertMany(indicatorDocs).then((result) => {
    console.log(`INSERTED ${result.length} indicators.`);
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
    removeModels([IndicatorModel, OutcomeModel])
    .then(() => readFormDocs())
    .then((result) => {
      formDocs = result;
      return Promise.resolve();
    })
    .then(() => insertIndicatorDocs())
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
