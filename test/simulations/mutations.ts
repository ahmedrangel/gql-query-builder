import { gqlMutation } from "../../src";

export const simulateMutations = () => {
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
};