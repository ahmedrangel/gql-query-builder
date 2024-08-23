import { gqlSubscription } from "../../src";

export const simulateSubscriptions = () => {
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
};