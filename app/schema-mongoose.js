const path = require('path');
const url = require('url');
const mongoose = require('mongoose');

const C = require('./config');

function lookupNation(nationCode) {
  return C.NATIONS.find(nation => (nation.code === nationCode));
}

function lookupJurisdiction(jurisdictionCode) {
  return C.JURISDICTIONS.find(jurisdiction => (jurisdiction.code === jurisdictionCode));
}

const IndicatorSchema = new mongoose.Schema({
  _id: { type: String },
  sectionCode: { type: String },
  title: { type: String, default: '' },
  forms: [{ type: String, ref: 'Form' }],
});

// IndicatorSchema.virtual('section').get(function indicatorSchemaVirtual() {
//   return getAlphabeticIndex(this.index);
// });

const OutputSchema = new mongoose.Schema({
  sectionCode: { type: String },
  title: { type: String, default: '' },
  indicators: [{ type: String, ref: 'Indicator' }],
});

// OutputSchema.virtual('section').get(function outputSchemaVirtual() {
//   return (this.index + 1).toString();
// });

const OutcomeSchema = new mongoose.Schema({
  sectionCode: { type: String },
  title: { type: String, default: '' },
  outputs: { type: [OutputSchema] },
  indicators: [{ type: String, ref: 'Indicator' }],
});

// OutcomeSchema.virtual('section').get(function outcomeSchemaVirtual() {
//   return (this.index + 1).toString();
// });

const FormFieldSchema = new mongoose.Schema({
  label: { type: String, default: '' },
  labelID: { type: String, default: '' },
  type: { type: String, default: '' },
  isMulti: { type: Boolean, default: false },
  items: { type: [String], default: [] },
});

FormFieldSchema.virtual('isString').get(function formFieldsIsString() {
  return (this.type === 'STRING');
});

FormFieldSchema.virtual('isDate').get(function formFieldsIsDate() {
  return (this.type === 'DATE');
});

FormFieldSchema.virtual('isNumber').get(function formFieldsIsNumber() {
  return (this.type === 'NUMBER');
});

FormFieldSchema.virtual('isInteger').get(function formFieldsIsInteger() {
  return (this.type === 'INTEGER');
});

FormFieldSchema.virtual('isPerson').get(function formFieldsIsPerson() {
  return (this.type === 'PERSON');
});

FormFieldSchema.virtual('isJurisdiction').get(function formFieldsIsPerson() {
  return (this.type === 'JURISDICTION');
});

FormFieldSchema.virtual('isChoice').get(function formFieldsIsChoice() {
  return (this.type === 'CHOICE');
});

const FormSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, default: '' },
  groupName: { type: String, default: '' },
  fields: { type: [FormFieldSchema] },
});

const ProjectSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, default: '' },
  subcontractors: { type: [String], default: [] },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  nationCode: { type: String, default: '' },
  jurisdictionCodes: { type: [String], default: [] },
  indicators: [{ type: String, ref: 'Indicator' }],
});

ProjectSchema.virtual('uri').get(function projectURI() {
  return url.resolve(C.SITE_BASE_URI, path.join('submit', this._id));
});

ProjectSchema.virtual('forms').get(function projectForms() {
  const forms = [];
  const formIDs = [];
  if (!this.indicators) return forms;
  if (!Array.isArray(this.indicators)) return forms;
  this.indicators.forEach((indicator) => {
    if (!Array.isArray(indicator.forms)) return;
    indicator.forms.forEach((form) => {
      if (formIDs.includes(form._id)) return;
      formIDs.push(form._id);
      forms.push(form);
    });
  });
  // console.log(this.indicators);
  return forms;
});

ProjectSchema.virtual('nation').get(function projectNation() {
  const nationDoc = { code: this.nationCode, name: '' };
  const nationObj = lookupNation(nationDoc.code);
  if (nationObj) nationDoc.name = nationObj.name;
  return nationDoc;
});

ProjectSchema.virtual('jurisdictions').get(function projectJurisdictions() {
  if (!Array.isArray(this.jurisdictionCodes)) return [];
  return (this.jurisdictionCodes.map((jurisdictionCode) => {
    const jurisdictionDoc = { code: jurisdictionCode, name: '' };
    const jurisdictionObj = lookupJurisdiction(jurisdictionDoc.code);
    if (jurisdictionObj) {
      jurisdictionDoc.name = jurisdictionObj.name;
      jurisdictionDoc.fullName = jurisdictionObj.fullName;
    }
    return jurisdictionDoc;
  }));
});

module.exports = { IndicatorSchema, OutcomeSchema, FormSchema, ProjectSchema };
