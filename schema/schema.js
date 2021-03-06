const axios = require("axios");
const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
} = graphql;

// schemas
const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then((res) => res.data);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        /**
         * parentValue is a user instance, with populated companyId property (instead of company)
         * by which you can grab company data
         */

        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then((res) => res.data);
      },
    },
  }),
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
    /**
     * Try to run next query in GraphiQL:
      {
        user(id: "23") {
          id,
          firstName,
          age,
          company {
            id,
            name,
            description
          }
        }
      }
    */
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((res) => res.data);
      },
    },
    /**
     * Try to run next query in GraphiQL:
      {
        company (id: "1") {
          id,
          name,
          description
        }
      }
    */
  },
});

// mutation
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, { firstName, age }) {
        return axios
          .post(`http://localhost:3000/users`, { firstName, age })
          .then((res) => res.data);
      },
    },
    /**
     * Try to run next query in GraphiQL:
      mutation {
        addUser(firstName: "Vladyslav", age: 25) {
          id,
          firstName,
          age
        }
      }
    */
    deleteUser: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
      resolve(parentValue, { id }) {
        return axios
          .delete(`http://localhost:3000/users/${id}`)
          .then((res) => res.data);
      },
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        return axios
          .patch(`http://localhost:3000/users/${args.id}`, args)
          .then((res) => res.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
