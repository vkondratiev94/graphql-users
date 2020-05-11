const _ = require("lodash");
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const users = [
  { id: "23", firstName: "Bill", age: 20 },
  { id: "47", firstName: "Samantha", age: 21 },
];

// schema
const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
  },
});

// root query
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    /**
     * You can read this as:
     * - you can ask me about users (1);
     * - if you give me the id of the user you're looking for (2), I will return a user back to you (3)
     */
    user: {
      // (1)
      type: UserType, // (3)
      args: { id: { type: GraphQLString } }, // (2)
      resolve(parentValue, args) {
        return _.find(users, { id: args.id });
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});

/**
 * Try to run next query in GraphiQL:
  {
    user(id: "23") {
      id,
      firstName,
      age
    }
  }
 */
