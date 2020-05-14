const axios = require("axios");
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

// schemas
const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  },
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        /**
         * parentValue is a user, with populated companyId property
         * by which you can grab company data
         */

        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then((res) => res.data);
      },
    },
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
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((res) => res.data);
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
