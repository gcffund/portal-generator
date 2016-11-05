const mongoose = require('mongoose');
const graphql = require('graphql');
const C = require('./config');

const OutcomeSchema = require('./mongoose-schema_defs').OutcomeSchema;
const FormSchema = require('./mongoose-schema_defs').FormSchema;
const ProjectSchema = require('./mongoose-schema_defs').ProjectSchema;

mongoose.Promise = global.Promise;
mongoose.set('debug', false);
mongoose.connect(C.DB_URI);

const OutcomeModel = mongoose.model('Outcome', OutcomeSchema);
const FormModel = mongoose.model('Form', FormSchema);
const ProjectModel = mongoose.model('Project', ProjectSchema);

// GraphQL Field Types
const GraphQLObjectType = graphql.GraphQLObjectType;
const GraphQLString = graphql.GraphQLString;
const GraphQLInt = graphql.GraphQLInt;
// const GraphQLFloat = graphql.GraphQLFloat;
const GraphQLBoolean = graphql.GraphQLBoolean;
const GraphQLSchema = graphql.GraphQLSchema;
const GraphQLList = graphql.GraphQLList;
// const GraphQLNonNull = graphql.GraphQLNonNull;

const Indicator = new GraphQLObjectType({
  name: 'Indicator',
  description: 'Indicator',
  fields: () => ({
    index: { type: GraphQLInt },
    section: { type: GraphQLString },
    title: { type: GraphQLString },
  }),
});

const Output = new GraphQLObjectType({
  name: 'Output',
  description: 'Output',
  fields: () => ({
    index: { type: GraphQLInt },
    section: { type: GraphQLString },
    title: { type: GraphQLString },
    indicators: { type: new GraphQLList(Indicator) },
  }),
});

const Outcome = new GraphQLObjectType({
  name: 'Outcome',
  description: 'Outcome',
  fields: () => ({
    index: { type: GraphQLInt },
    section: { type: GraphQLString },
    title: { type: GraphQLString },
    outputs: { type: new GraphQLList(Output) },
    indicators: { type: new GraphQLList(Indicator) },
  }),
});

const FormField = new GraphQLObjectType({
  name: 'FormField',
  description: 'Form Field',
  fields: () => ({
    label: { type: GraphQLString },
    type: { type: GraphQLString },
    isMulti: { type: GraphQLBoolean },
    items: { type: new GraphQLList(GraphQLString) },
    isString: { type: GraphQLBoolean },
    isDate: { type: GraphQLBoolean },
    isNumber: { type: GraphQLBoolean },
    isName: { type: GraphQLBoolean },
    isChoice: { type: GraphQLBoolean },
  }),
});

const Form = new GraphQLObjectType({
  name: 'Form',
  description: 'Form',
  fields: () => ({
    title: { type: GraphQLString },
    groupName: { type: GraphQLString },
    fields: { type: new GraphQLList(FormField) },
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
    name: { type: GraphQLString },
    subcontractors: { type: new GraphQLList(GraphQLString) },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    nation: { type: Nation },
    jurisdictions: { type: new GraphQLList(Jurisdiction) },
    indicators: { type: new GraphQLList(GraphQLString) },
  }),
});

const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'root query',
  fields: () => ({
    outcomes: {
      type: new GraphQLList(Outcome),
      resolve() {
        return OutcomeModel.find({});
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
        return ProjectModel.find({});
      },
    },
  }),
});

const Schema = new GraphQLSchema({
  query: Query,
  // mutation: Mutation,
});

module.exports = Schema;
