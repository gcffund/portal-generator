const mongoose = require('mongoose');
const graphql = require('graphql');
const C = require('./config');

const IndicatorSchema = require('./schema-mongoose').IndicatorSchema;
const OutcomeSchema = require('./schema-mongoose').OutcomeSchema;
const FormSchema = require('./schema-mongoose').FormSchema;
const ProjectSchema = require('./schema-mongoose').ProjectSchema;

mongoose.Promise = global.Promise;
mongoose.set('debug', false);
mongoose.connect(C.DB_URI);

const IndicatorModel = mongoose.model('Indicator', IndicatorSchema);
const OutcomeModel = mongoose.model('Outcome', OutcomeSchema);
const FormModel = mongoose.model('Form', FormSchema);
const ProjectModel = mongoose.model('Project', ProjectSchema);

// GraphQL Field Types
const GraphQLObjectType = graphql.GraphQLObjectType;
const GraphQLString = graphql.GraphQLString;
// const GraphQLInt = graphql.GraphQLInt;
// const GraphQLFloat = graphql.GraphQLFloat;
const GraphQLBoolean = graphql.GraphQLBoolean;
const GraphQLSchema = graphql.GraphQLSchema;
const GraphQLList = graphql.GraphQLList;
// const GraphQLNonNull = graphql.GraphQLNonNull;

const FormField = new GraphQLObjectType({
  name: 'FormField',
  description: 'Form Field',
  fields: () => ({
    label: { type: GraphQLString },
    labelID: { type: GraphQLString },
    type: { type: GraphQLString },
    isMulti: { type: GraphQLBoolean },
    items: { type: new GraphQLList(GraphQLString) },
    isString: { type: GraphQLBoolean },
    isDate: { type: GraphQLBoolean },
    isNumber: { type: GraphQLBoolean },
    isInteger: { type: GraphQLBoolean },
    isPerson: { type: GraphQLBoolean },
    isJurisdiction: { type: GraphQLBoolean },
    isChoice: { type: GraphQLBoolean },
  }),
});

const Form = new GraphQLObjectType({
  name: 'Form',
  description: 'Form',
  fields: () => ({
    _id: { type: GraphQLString },
    title: { type: GraphQLString },
    groupName: { type: GraphQLString },
    fields: { type: new GraphQLList(FormField) },
  }),
});

const Indicator = new GraphQLObjectType({
  name: 'Indicator',
  description: 'Indicator',
  fields: () => ({
    sectionCode: { type: GraphQLString },
    title: { type: GraphQLString },
    forms: { type: new GraphQLList(Form) },
  }),
});

const Output = new GraphQLObjectType({
  name: 'Output',
  description: 'Output',
  fields: () => ({
    sectionCode: { type: GraphQLString },
    title: { type: GraphQLString },
    indicators: { type: new GraphQLList(Indicator) },
  }),
});

const Outcome = new GraphQLObjectType({
  name: 'Outcome',
  description: 'Outcome',
  fields: () => ({
    sectionCode: { type: GraphQLString },
    title: { type: GraphQLString },
    outputs: { type: new GraphQLList(Output) },
    indicators: { type: new GraphQLList(Indicator) },
  }),
});

const Nation = new GraphQLObjectType({
  name: 'Nation',
  description: 'Nation',
  fields: () => ({
    code: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
});

const Jurisdiction = new GraphQLObjectType({
  name: 'Jurisdiction',
  description: 'Jurisdiction',
  fields: () => ({
    code: { type: GraphQLString },
    name: { type: GraphQLString },
    fullName: { type: GraphQLString },
  }),
});

const Project = new GraphQLObjectType({
  name: 'Project',
  description: 'Project',
  fields: () => ({
    _id: { type: GraphQLString },
    uri: { type: GraphQLString },
    name: { type: GraphQLString },
    subcontractors: { type: new GraphQLList(GraphQLString) },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    nation: { type: Nation },
    jurisdictions: { type: new GraphQLList(Jurisdiction) },
    indicators: { type: new GraphQLList(Indicator) },
    forms: { type: new GraphQLList(Form) },
  }),
});

const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'root query',
  fields: () => ({
    jurisdictions: {
      type: new GraphQLList(Jurisdiction),
      resolve() {
        return C.JURISDICTIONS;
      },
    },
    outcomes: {
      type: new GraphQLList(Outcome),
      resolve() {
        const p1 = OutcomeModel.find({});
        // p1.populate({ path: 'jurisdictions', populate: { path: 'governor delegates' } });
        p1.populate({ path: 'indicators', populate: { path: 'forms' } });
        p1.populate({ path: 'outputs.indicators', populate: { path: 'forms' } });
        return p1;
      },
    },
    forms: {
      type: new GraphQLList(Form),
      resolve() {
        return FormModel.find({});
      },
    },
    projects: {
      type: new GraphQLList(Project),
      resolve() {
        const p1 = ProjectModel.find({});
        p1.populate({ path: 'indicators', populate: { path: 'forms' } });
        return p1;
      },
    },
  }),
});

const Schema = new GraphQLSchema({
  query: Query,
  // mutation: Mutation,
});

module.exports = Schema;
