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

FormFieldSchema.virtual('isName').get(function formFieldsIsName() {
  return (this.type === 'NAME');
});

FormFieldSchema.virtual('isChoice').get(function formFieldsIsChoice() {
  return (this.type === 'CHOICE');
});

const FormSchema = new mongoose.Schema({
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
  indicators: { type: [String], default: [] },
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
