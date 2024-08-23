import DefaultAppSyncQueryAdapter from "../src/adapters/DefaultAppSyncQueryAdapter";
import { gqlQuery, gqlMutation, gqlSubscription } from "../src";

describe("Query", () => {
  it("generates query", () => {
    const query = gqlQuery({
      operation: "thoughts",
      fields: ["id", "name", "thought"]
    });

    expect(query).toStrictEqual({
      query: "query { thoughts { id name thought } }",
      variables: {}
    });
  });

  it("generates query with alias", () => {
    const query = gqlQuery({
      operation: {
        name: "thoughts",
        alias: "myThoughts"
      },
      fields: ["id", "name", "thought"]
    });

    expect(query).toStrictEqual({
      query: "query { myThoughts: thoughts { id name thought } }",
      variables: {}
    });
  });

  it("generates queries with the same operation with different alias", () => {
    const query = gqlQuery([
      {
        operation: {
          name: "thoughts",
          alias: "myThoughts"
        },
        fields: ["id", "name", "thought"]
      },
      {
        operation: {
          name: "thoughts",
          alias: "yourThoughts"
        },
        fields: ["id", "name", "thought"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query { myThoughts: thoughts { id name thought } yourThoughts: thoughts { id name thought } }",
      variables: {}
    });
  });

  it("generates query when adapter argument is provided", () => {
    const query = gqlQuery(
      {
        operation: "thoughts",
        fields: ["id", "name", "thought"]
      },
      DefaultAppSyncQueryAdapter
    );

    expect(query).toStrictEqual({
      query: "query Thoughts { thoughts { nodes { id name thought } } }",
      variables: {}
    });
  });

  it("generates query when adapter and alias arguments are provided", () => {
    const query = gqlQuery(
      {
        operation: {
          name: "thoughts",
          alias: "myThoughts"
        },
        fields: ["id", "name", "thought"]
      },
      DefaultAppSyncQueryAdapter
    );

    expect(query).toStrictEqual({
      query: "query Thoughts { myThoughts: thoughts { nodes { id name thought } } }",
      variables: {}
    });
  });

  it("generate query with undefined variables", () => {
    const query = gqlQuery({
      operation: "user",
      fields: ["id", "name", "email"],
      variables: { id: { type: "Int" }, name: undefined }
    });

    expect(query).toStrictEqual({
      query: "query ($id: Int, $name: String) { user (id: $id, name: $name) { id name email } }",
      variables: { id: undefined, name: undefined }
    });
  });

  it("generates query with variables", () => {
    const query = gqlQuery({
      operation: "thought",
      variables: { id: 1 },
      fields: ["id", "name", "thought"]
    });

    expect(query).toStrictEqual({
      query: "query ($id: Int) { thought (id: $id) { id name thought } }",
      variables: { id: 1 }
    });
  });

  it("generates query with sub fields selection", () => {
    const query = gqlQuery({
      operation: "orders",
      fields: [
        "id",
        "amount",
        {
          user: [
            "id",
            "name",
            "email",
            {
              address: ["city", "country"]
            },
            {
              account: ["holder"]
            }
          ]
        }
      ]
    });

    expect(query).toStrictEqual({
      query: "query { orders { id amount user { id name email address { city country } account { holder } } } }",
      variables: {}
    });
  });

  it("generates query with multiple sub fields selection in same object", () => {
    const query = gqlQuery({
      operation: "orders",
      fields: [
        "id",
        "amount",
        {
          user: [
            "id",
            "name",
            "email",
            {
              address: ["city", "country"],
              account: ["holder"]
            }
          ]
        }
      ]
    });

    expect(query).toStrictEqual({
      query: "query { orders { id amount user { id name email address { city country } account { holder } } } }",
      variables: {}
    });
  });

  it("generates query with required variables", () => {
    const query = gqlQuery({
      operation: "userLogin",
      variables: {
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true }
      },
      fields: ["userId", "token"]
    });

    expect(query).toStrictEqual({
      query: "query ($email: String!, $password: String!) { userLogin (email: $email, password: $password) { userId token } }",
      variables: { email: "jon.doe@example.com", password: "123456" }
    });
  });

  it("generate query with array variable (array items are not nullable)", () => {
    const query = gqlQuery({
      operation: "search",
      variables: {
        tags: { value: ["a", "b", "c"], list: [true], type: "String" }
      },
      fields: ["id", "title", "content", "tag"]
    });

    expect(query).toStrictEqual({
      query: "query ($tags: [String!]) { search (tags: $tags) { id title content tag } }",
      variables: { tags: ["a", "b", "c"] }
    });
  });

  it("generate query with array variable (array items are nullable)", () => {
    const query = gqlQuery({
      operation: "search",
      variables: {
        tags: { value: ["a", "b", "c", null], list: true }
      },
      fields: ["id", "title", "content", "tag"]
    });

    expect(query).toStrictEqual({
      query: "query ($tags: [String]) { search (tags: $tags) { id title content tag } }",
      variables: { tags: ["a", "b", "c", null] }
    });
  });

  it("generates multiple queries", () => {
    const query = gqlQuery([
      {
        operation: "thoughts",
        fields: ["id", "name", "thought"]
      },
      {
        operation: "prayers",
        fields: ["id", "name", "prayer"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query { thoughts { id name thought } prayers { id name prayer } }",
      variables: {}
    });
  });

  it("generates query with variables nested in fields", () => {
    const query = gqlQuery([
      {
        operation: "getPublicationNames",
        fields: [
          {
            operation: "publication",
            variables: { id: { value: 12, type: "ID" } },
            fields: ["id", "name"]
          }
        ]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query ($id: ID) { getPublicationNames { publication (id: $id) { id name } } }",
      variables: { id: 12 }
    });
  });

  it("generates query with nested variables in nested fields", () => {
    const query = gqlQuery([
      {
        operation: "getPublicationNames",
        fields: [
          {
            operation: "publication",
            variables: { id: { value: 12, type: "ID" } },
            fields: [
              "id",
              "name",
              {
                operation: "platforms",
                variables: {
                  visible: { type: "Boolean", value: true },
                  platformLimit: { name: "limit", value: 999, type: "Int" }
                },
                fields: [
                  "totalCount",
                  {
                    edges: [
                      "label",
                      "code",
                      "parentId",
                      "id",
                      {
                        operation: "rights",
                        variables: {
                          idChannel: { type: "Int", required: true },
                          rightsLimit: {
                            name: "limit",
                            value: 999,
                            type: "Int"
                          },
                          rightsOffset: {
                            name: "offset",
                            value: 0,
                            type: "Int"
                          }
                        },
                        fields: [
                          "id",
                          "label",
                          {
                            operation: "users",
                            variables: {
                              userLimit: {
                                name: "limit",
                                value: 999,
                                type: "Int"
                              },
                              userFilter: {
                                name: "filters",
                                value: "doe",
                                type: "String"
                              }
                            },
                            fields: ["id", "name"]
                          }
                        ]
                      }
                    ]
                  },
                  "subField",
                  {
                    operation: "channels",
                    variables: {
                      idChannel: { name: "id", type: "Int", required: true },
                      channelLimit: { name: "limit", value: 999, type: "Int" }
                    },
                    fields: ["id", "label"]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query ($id: ID, $visible: Boolean, $platformLimit: Int, $idChannel: Int!, $channelLimit: Int, $rightsLimit: Int, $rightsOffset: Int, $userLimit: Int, $userFilter: String) { getPublicationNames { publication (id: $id) { id name platforms (visible: $visible, limit: $platformLimit) { totalCount edges { label code parentId id rights (idChannel: $idChannel, limit: $rightsLimit, offset: $rightsOffset) { id label users (limit: $userLimit, filters: $userFilter) { id name } } } subField channels (id: $idChannel, limit: $channelLimit) { id label } } } } }",
      variables: {
        id: 12,
        visible: true,
        platformLimit: 999,
        idChannel: undefined,
        channelLimit: 999,
        rightsLimit: 999,
        rightsOffset: 0,
        userLimit: 999,
        userFilter: "doe"
      }
    });
  });

  it("generates query with object variables nested in fields", () => {
    const query = gqlQuery([
      {
        operation: "getPublicationNames",
        variables: { id: { type: "ID", value: 12 } },
        fields: [
          {
            operation: "publication",
            variables: {
              input: {
                value: { type: "news", tz: "EST" },
                type: "FilterInput"
              }
            },
            fields: ["name", "publishedAt"]
          }
        ]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query ($input: FilterInput, $id: ID) { getPublicationNames (id: $id) { publication (input: $input) { name publishedAt } } }",
      variables: {
        id: 12,
        input: { type: "news", tz: "EST" }
      }
    });
  });

  it("generates query without extraneous brackets for operation with no fields", () => {
    const query = gqlQuery({
      operation: "getFilteredUsersCount"
    });

    expect(query).toStrictEqual({
      query: "query { getFilteredUsersCount }",
      variables: {}
    });
  });

  it("generates queries without extraneous brackets for operations with no fields", () => {
    const query = gqlQuery([
      {
        operation: "getFilteredUsersCount"
      },
      {
        operation: "getAllUsersCount"
      }
    ]);

    expect(query).toStrictEqual({
      query: "query { getFilteredUsersCount getAllUsersCount }",
      variables: {}
    });
  });

  it("generates query without extraneous brackets for operations with empty fields", () => {
    const query = gqlQuery({
      operation: "getFilteredUsersCount",
      fields: []
    });

    expect(query).toStrictEqual({
      query: "query { getFilteredUsersCount }",
      variables: {}
    });
  });

  it("generates queries without extraneous brackets for operations with empty fields", () => {
    const query = gqlQuery([
      {
        operation: "getFilteredUsersCount",
        fields: []
      },
      {
        operation: "getAllUsersCount",
        fields: []
      }
    ]);

    expect(query).toStrictEqual({
      query: "query { getFilteredUsersCount getAllUsersCount }",
      variables: {}
    });
  });

  it("generates query without extraneous brackets for operation with empty fields of fields", () => {
    const query = gqlQuery({
      operation: "getFilteredUsers",
      fields: [
        {
          count: []
        }
      ]
    });

    expect(query).toStrictEqual({
      query: "query { getFilteredUsers { count } }",
      variables: {}
    });
  });

  it("generates queries without extraneous brackets for operations with empty fields of fields", () => {
    const query = gqlQuery([
      {
        operation: "getFilteredUsers",
        fields: [
          {
            count: []
          }
        ]
      },
      {
        operation: "getFilteredPosts",
        fields: [
          {
            count: []
          }
        ]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query { getFilteredUsers { count } getFilteredPosts { count } }",
      variables: {}
    });
  });

  it("generates query without extraneous brackets for operation with nested operation empty fields", () => {
    const query = gqlQuery({
      operation: "getFilteredUsers",
      fields: [
        {
          operation: "average_age",
          fields: [],
          variables: { format: "months" }
        }
      ]
    });

    expect(query).toStrictEqual({
      query: "query ($format: String) { getFilteredUsers { average_age (format: $format) } }",
      variables: { format: "months" }
    });
  });

  it("generates queries without extraneous brackets for operations with nested operation empty fields", () => {
    const query = gqlQuery([
      {
        operation: "getFilteredUsers",
        fields: [
          {
            operation: "average_age",
            fields: [],
            variables: {}
          }
        ]
      },
      {
        operation: "getFilteredPosts",
        fields: [
          {
            operation: "average_viewers",
            fields: [],
            variables: {}
          }
        ]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query { getFilteredUsers { average_age } getFilteredPosts { average_viewers } }",
      variables: {}
    });
  });

  it("generates queries with object variables for multiple queries", () => {
    const query = gqlQuery([
      {
        operation: "getPublicationData",
        variables: { id: { type: "ID", value: 12 } },
        fields: ["publishedAt"]
      },
      {
        operation: "getPublicationUsers",
        variables: { name: { value: "johndoe" } },
        fields: ["full_name"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query ($id: ID, $name: String) { getPublicationData (id: $id) { publishedAt } getPublicationUsers (name: $name) { full_name } }",
      variables: {
        id: 12,
        name: "johndoe"
      }
    });
  });

  it("generates queries with object variables for multiple queries with nested variables", () => {
    const query = gqlQuery([
      {
        operation: "getPublicationData",
        variables: { id: { type: "ID", value: 12 } },
        fields: [
          "publishedAt",
          {
            operation: "publicationOrg",
            variables: { location: "mars" },
            fields: ["name"]
          }
        ]
      },
      {
        operation: "getPublicationUsers",
        variables: { name: { value: "johndoe" } },
        fields: ["full_name"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "query ($id: ID, $location: String, $name: String) { getPublicationData (id: $id) { publishedAt publicationOrg (location: $location) { name } } getPublicationUsers (name: $name) { full_name } }",
      variables: {
        id: 12,
        location: "mars",
        name: "johndoe"
      }
    });
  });

  it("generates query with operation name", () => {
    const query = gqlQuery(
      [
        {
          operation: "getPublicationNames",
          variables: { id: { type: "ID", value: 12 } },
          fields: ["name", "publishedAt"]
        }
      ],
      null,
      {
        operationName: "operation"
      }
    );

    expect(query).toStrictEqual({
      query: "query operation ($id: ID) { getPublicationNames (id: $id) { name publishedAt } }",
      variables: {
        id: 12
      }
    });
  });

  it("generates query arguments different from variable name", () => {
    const query = gqlQuery([
      {
        operation: "someoperation",
        fields: [
          {
            operation: "nestedoperation",
            fields: ["field1"],
            variables: {
              id2: {
                name: "id",
                type: "ID",
                value: 123
              }
            }
          }
        ],
        variables: {
          id1: {
            name: "id",
            type: "ID",
            value: 456
          }
        }
      }
    ]);

    expect(query).toStrictEqual({
      query: "query ($id2: ID, $id1: ID) { someoperation (id: $id1) { nestedoperation (id: $id2) { field1 } } }",
      variables: {
        id1: 456,
        id2: 123
      }
    });
  });

  it("generates query arguments with inline fragment", () => {
    const query = gqlQuery({
      operation: "thought",
      fields: [
        "id",
        "name",
        "thought",
        {
          operation: "InlineFragmentType",
          fields: ["grade"],
          inlineFragment: true
        }
      ]
    });

    expect(query).toStrictEqual({
      query: "query { thought { id name thought ... on InlineFragmentType { grade } } }",
      variables: {}
    });
  });

  it("generates query arguments with named fragment", () => {
    const query = gqlQuery({
      operation: "thought",
      fields: [
        {
          operation: "NamedFragment",
          namedFragment: true
        }
      ]
    }, null, {
      fragment: [{
        name: "NamedFragment",
        on: "User",
        fields: ["id", "name", "thought", "grade"]
      }]
    });

    expect(query).toStrictEqual({
      query: "query { thought { ...NamedFragment } } fragment NamedFragment on User { id name thought grade }",
      variables: {}
    });
  });

  it("generates aliased nested queries", () => {
    const query = gqlQuery([
      {
        operation: "singleRootQuery",
        variables: {},
        fields: [
          {
            operation: "nestedQuery",
            variables: {},
            fields: ["whatever"]
          },
          {
            operation: {
              alias: "duplicatedNestedQuery",
              name: "nestedQuery"
            },
            variables: {},
            fields: ["whatever"]
          }
        ]
      }
    ]); // query
    expect(query).toStrictEqual({
      query: "query { singleRootQuery { nestedQuery { whatever } duplicatedNestedQuery: nestedQuery { whatever } } }",
      variables: {}
    }); // expect
  }); // test
});

describe("Mutation", () => {
  it("generates mutation query", () => {
    const query = gqlMutation({
      operation: "thoughtCreate",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      },
      fields: ["id"]
    });

    expect(query).toStrictEqual({
      query: "mutation ($name: String, $thought: String) { thoughtCreate (name: $name, thought: $thought) { id } }",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      }
    });
  });

  it("generates mutation query with alias", () => {
    const query = gqlMutation({
      operation: {
        name: "thoughtCreate",
        alias: "myThoughtCreate"
      },
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      },
      fields: ["id"]
    });

    expect(query).toStrictEqual({
      query: "mutation ($name: String, $thought: String) { myThoughtCreate: thoughtCreate (name: $name, thought: $thought) { id } }",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      }
    });
  });

  it("generates mutations with the same operation with different alias", () => {
    const query = gqlMutation([
      {
        operation: {
          name: "thoughtCreate",
          alias: "myThoughtCreate"
        },
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things."
        },
        fields: ["id"]
      },
      {
        operation: {
          name: "thoughtCreate",
          alias: "yourThoughtCreate"
        },
        variables: {
          character: "Eddard Stark",
          quote: "Winter is coming."
        },
        fields: ["id"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "mutation ($name: String, $thought: String, $character: String, $quote: String) { myThoughtCreate: thoughtCreate (name: $name, thought: $thought) { id } yourThoughtCreate: thoughtCreate (character: $character, quote: $quote) { id } }",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things.",
        character: "Eddard Stark",
        quote: "Winter is coming."
      }
    });
  });

  it("generates mutation query with required variables", () => {
    const query = gqlMutation({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true }
      },
      fields: ["userId"]
    });

    expect(query).toStrictEqual({
      query: "mutation ($name: String, $email: String!, $password: String!) { userSignup (name: $name, email: $email, password: $password) { userId } }",
      variables: {
        name: "Jon Doe",
        email: "jon.doe@example.com",
        password: "123456"
      }
    });
  });

  it("generates multiple mutations", () => {
    const query = gqlMutation([
      {
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things."
        },
        fields: ["id"]
      },
      {
        operation: "prayerCreate",
        variables: {
          name: { value: "Tyrion Lannister" },
          prayer: { value: "I wish for winter." }
        },
        fields: ["id"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "mutation ($name: String, $thought: String, $prayer: String) { thoughtCreate (name: $name, thought: $thought) { id } prayerCreate (name: $name, prayer: $prayer) { id } }",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things.",
        prayer: "I wish for winter."
      }
    });
  });

  it("generates multiple mutations with named variables", () => {
    const query = gqlMutation([
      {
        operation: "delete0: deleteUser",
        variables: {
          id0: {
            name: "id",
            type: "ID",
            value: "user_1234"
          }
        },
        fields: ["id"]
      },
      {
        operation: "delete1: deleteUser",
        variables: {
          id1: {
            name: "id",
            type: "ID",
            value: "user_5678"
          }
        },
        fields: ["id"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "mutation ($id0: ID, $id1: ID) { delete0: deleteUser (id: $id0) { id } delete1: deleteUser (id: $id1) { id } }",
      variables: {
        id0: "user_1234",
        id1: "user_5678"
      }
    });
  });

  it("generates mutation with required variables", () => {
    const query = gqlMutation({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true }
      },
      fields: ["id"]
    });

    expect(query).toStrictEqual({
      query: "mutation ($name: String, $email: String!, $password: String!) { userSignup (name: $name, email: $email, password: $password) { id } }",
      variables: {
        name: "Jon Doe",
        email: "jon.doe@example.com",
        password: "123456"
      }
    });
  });

  it("generates mutation custom type", () => {
    const query = gqlMutation({
      operation: "userPhoneNumber",
      variables: {
        phone: {
          value: { prefix: "+91", number: "9876543210" },
          type: "PhoneNumber",
          required: true
        }
      },
      fields: ["id"]
    });

    expect(query).toStrictEqual({
      query: "mutation ($phone: PhoneNumber!) { userPhoneNumber (phone: $phone) { id } }",
      variables: {
        phone: { prefix: "+91", number: "9876543210" }
      }
    });
  });

  it("generate mutation without fields selection", () => {
    const query = gqlMutation({
      operation: "logout"
    });

    expect(query).toStrictEqual({
      query: "mutation { logout }",
      variables: {}
    });
  });

  it("generates nested mutation operations without variables", () => {
    const query = gqlMutation({
      operation: "namespaceField",
      fields: [
        {
          operation: "innerMutation",
          fields: ["id"],
          variables: {}
        }
      ]
    });

    expect(query).toStrictEqual({
      query: "mutation { namespaceField { innerMutation { id } } }",
      variables: {}
    });
  });

  it("generates nested mutation operations with variables", () => {
    const query = gqlMutation({
      operation: "namespaceField",
      fields: [
        {
          operation: "innerMutation",
          variables: {
            name: { value: "stringy" }
          },
          fields: ["id"]
        }
      ]
    });

    expect(query).toStrictEqual({
      query: "mutation ($name: String) { namespaceField { innerMutation (name: $name) { id } } }",
      variables: { name: "stringy" }
    });
  });

  it("generates multiple nested mutation operations with variables", () => {
    const query = gqlMutation([
      {
        operation: "namespaceField",
        fields: [
          {
            operation: "mutationA",
            variables: {
              nameA: { value: "A" }
            },
            fields: ["id"]
          }
        ]
      },
      {
        operation: "namespaceField",
        fields: [
          {
            operation: "mutationB",
            variables: {
              nameB: { value: "B" }
            },
            fields: ["id"]
          }
        ]
      }
    ]);

    expect(query).toStrictEqual({
      query: "mutation ($nameB: String, $nameA: String) { namespaceField { mutationA (nameA: $nameA) { id } } namespaceField { mutationB (nameB: $nameB) { id } } }",
      variables: { nameA: "A", nameB: "B" }
    });
  });

  it("generates mutation with operation name", () => {
    const query = gqlMutation(
      [
        {
          operation: "thoughtCreate",
          variables: {
            name: "Tyrion Lannister",
            thought: "I drink and I know things."
          },
          fields: ["id"]
        }
      ],
      undefined,
      {
        operationName: "operation"
      }
    );

    expect(query).toStrictEqual({
      query: "mutation operation ($name: String, $thought: String) { thoughtCreate (name: $name, thought: $thought) { id } }",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      }
    });
  });

  it("generates mutation query with named fragment", () => {
    const query = gqlMutation({
      operation: "thoughtCreate",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      },
      fields: [{
        operation: "NamedFragment",
        namedFragment: true
      }]
    }, null, {
      fragment: [{
        name: "NamedFragment",
        on: "Create",
        fields: ["id"]
      }]
    });

    expect(query).toStrictEqual({
      query: "mutation ($name: String, $thought: String) { thoughtCreate (name: $name, thought: $thought) { ...NamedFragment } } fragment NamedFragment on Create { id }",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      }
    });
  });
});

describe("Subscriptions", () => {
  it("generates subscriptions", () => {
    const query = gqlSubscription([
      {
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things."
        },
        fields: ["id"]
      },
      {
        operation: "prayerCreate",
        variables: {
          name: { value: "Tyrion Lannister" },
          prayer: { value: "I wish for winter." }
        },
        fields: ["id"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "subscription ($name: String, $thought: String, $prayer: String) { thoughtCreate (name: $name, thought: $thought) { id } prayerCreate (name: $name, prayer: $prayer) { id } }",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things.",
        prayer: "I wish for winter."
      }
    });
  });

  it("generates subscriptions with query alias", () => {
    const query = gqlSubscription([
      {
        operation: {
          name: "thoughtCreate",
          alias: "myThoughtCreate"
        },
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things."
        },
        fields: ["id"]
      },
      {
        operation: {
          name: "prayerCreate",
          alias: "myPrayerCreate"
        },
        variables: {
          name: { value: "Tyrion Lannister" },
          prayer: { value: "I wish for winter." }
        },
        fields: ["id"]
      }
    ]);

    expect(query).toStrictEqual({
      query: "subscription ($name: String, $thought: String, $prayer: String) { myThoughtCreate: thoughtCreate (name: $name, thought: $thought) { id } myPrayerCreate: prayerCreate (name: $name, prayer: $prayer) { id } }",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things.",
        prayer: "I wish for winter."
      }
    });
  });

  it("generates subscription with required variables", () => {
    const query = gqlSubscription({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true }
      },
      fields: ["id"]
    });

    expect(query).toStrictEqual({
      query: "subscription ($name: String, $email: String!, $password: String!) { userSignup (name: $name, email: $email, password: $password) { id } }",
      variables: {
        name: "Jon Doe",
        email: "jon.doe@example.com",
        password: "123456"
      }
    });
  });

  it("generates subscription custom type", () => {
    const query = gqlSubscription({
      operation: "userPhoneNumber",
      variables: {
        phone: {
          value: { prefix: "+91", number: "9876543210" },
          type: "PhoneNumber",
          required: true
        }
      },
      fields: ["id"]
    });

    expect(query).toStrictEqual({
      query: "subscription ($phone: PhoneNumber!) { userPhoneNumber (phone: $phone) { id } }",
      variables: {
        phone: { prefix: "+91", number: "9876543210" }
      }
    });
  });
});
