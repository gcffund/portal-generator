const express = require('express');
const GraphHTTP = require('express-graphql');
const Schema = require('./app/schema-graphql');
const C = require('./app/config');

const appAPI = express();

appAPI.use('/', new GraphHTTP({
  schema: Schema,
  pretty: true,
  graphiql: true,
}));

appAPI.listen(C.GRAPHQL_PORT, () => {
  console.log(`GraphQL App listening on port ${C.GRAPHQL_PORT}`);
});
