# GraphQL Payload Builder
This is an optimized fork of [gql-query-builder](https://github.com/atulmy/gql-query-builder) with extra features for generating GraphQL payloads using plain JavaScript Objects (JSON).

## Install

`npm install gql-payload --save` or `yarn add gql-payload`

## Usage

```ts
import { gqlQuery, gqlMutation, gqlSubscription } from 'gql-payload'

const query = gqlQuery(options: object)
const mutation = gqlMutation(options: object)
const subscription = gqlSubscription(options: object)
```

### Options

`options` is `{ operation, fields, variables }` or an array of `options`

<table width="100%">
  <thead>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Type</th>
    <th>Required</th>
    <th>Example</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>operation</td>
    <td>Name of operation to be executed on server</td>
    <td>String | Object</td>
    <td>Yes</td>
    <td>
      getThoughts, createThought
      <br/><br />
      <code>{ name: 'getUser', alias: 'getAdminUser' }</code>
    </td>
  </tr>
  <tr>
    <td>fields</td>
    <td>Selection of fields</td>
    <td>Array</td>
    <td>No</td>
    <td>
      <code>['id', 'name', 'thought']</code>
      <br/><br />
      <code>['id', 'name', 'thought', { user: ['id', 'email'] }]</code>
    </td>
  </tr>
  <tr>
    <td>variables</td>
    <td>Variables sent to the operation</td>
    <td>Object</td>
    <td>No</td>
    <td>
      { key: value } eg: <code>{ id: 1 }</code>
      <br/><br/>
      { key: { value: value, required: true, type: GQL type, list: true, name: argument name } eg:
      <br />
      <code>{
  email: { value: "user@example.com", required: true },
  password: { value: "123456", required: true },
  secondaryEmails: { value: [], required: false, type: 'String', list: true, name: secondaryEmail }
}</code>
    </td>
  </tr>
  </tbody>
</table>

### Adapter

An optional second argument `adapter` is a typescript/javascript class that implements `IQueryAdapter`, `IMutationAdapter` or `ISubscriptionAdapter`.

If adapter is undefined then `src/adapters/DefaultQueryAdapter` or `src/adapters/DefaultMutationAdapter` is used.

```ts
import { gqlQuery } as gql from 'gql-payload'

const query = gqlQuery(options: object, adapter?: MyCustomQueryAdapter,config?: object)
```

### Config

<table width="100%">
  <thead>

  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Type</th>
    <th>Required</th>
    <th>Example</th>
  </tr>

  </thead>
  <tbody>

  <tr>
    <td>operationName</td>
    <td>Name of operation to be sent to the server</td>
    <td>String</td>
    <td>No</td>
    <td>
      getThoughts, createThought
    </td>
  </tr>
    <tr>
    <td>fragment</td>
    <td>Named fragment config for reusable fields to be sent to the server</td>
    <td>Array</td>
    <td>No</td>
    <td>
      <code>[{
  name: "NamedFragment",
  on: "User",
  fields: ["grade"]
}]</code>
    </td>
  </tr>
  </tbody>
</table>

## Examples

1. [Query](#query)
2. [Query (with variables)](#query-with-variables)
3. [Query (with nested fields selection)](#query-with-nested-fields-selection)
4. [Query (with required variables)](#query-with-required-variables)
5. [Query (with custom argument name)](#query-with-custom-argument-name)
6. [Query (with operation name)](#query-with-operation-name)
7. [Query (with empty fields)](#query-with-empty-fields)
8. [Query (with alias)](#query-with-alias)
9. [Query (with adapter defined)](#query-with-adapter-defined)
10. [Query (with inline fragment)](#query-with-inline-fragment)
11. [Query (with named fragment)](#query-with-named-fragment)
12. [Mutation](#mutation)
13. [Mutation (with required variables)](#mutation-with-required-variables)
14. [Mutation (with custom types)](#mutation-with-custom-types)
15. [Mutation (with adapter defined)](#mutation-with-adapter-defined)
16. [Mutation (with operation name)](#mutation-with-operation-name)
17. [Subscription](#subscription)
18. [Subscription (with adapter defined)](#subscription-with-adapter-defined)
19. [Example with Fetch](#example-with-fetch)
20. [Example with Ofetch](#example-with-ofetch)
21. [Example with Axios](#example-with-axios)

#### Query:

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery({
  operation: "thoughts",
  fields: ["id", "name", "thought"]
});

console.log(query);
```

Output

```js
{
  query: 'query {thoughts { id name thought } }',
  variables: {}
}
```

[↑ all examples](#examples)

#### Query (with variables):

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery({
  operation: "thought",
  variables: { id: 1 },
  fields: ["id", "name", "thought"]
});

console.log(query)
```

Output

```js
{
  query: 'query ($id: Int) { thought (id: $id) { id name thought } }',
  variables: { id: 1 }
}
```

[↑ all examples](#examples)

#### Query (with nested fields selection):

```js
import { gqlQuery } from "gql-payload";

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
          address: [
            "city",
            "country"
          ]
        }
      ]
    }
  ]
});

console.log(query);
```

Output

```js
{
  query: 'query { orders { id amount user { id name email address { city country } } } }',
  variables: {}
}
```

[↑ all examples](#examples)

#### Query (with required variables):

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery({
  operation: "userLogin",
  variables: {
    email: { value: "jon.doe@example.com", required: true },
    password: { value: "123456", required: true }
  },
  fields: ["userId", "token"]
});

console.log(query);
```

Output

```js
{
  query: 'query ($email: String!, $password: String!) { userLogin (email: $email, password: $password) { userId token } }',
  variables: { email: 'jon.doe@example.com', password: '123456' }
}
```

[↑ all examples](#examples)

#### Query (with custom argument name):

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery([{
  operation: "someoperation",
  fields: [{
    operation: "nestedoperation",
    fields: ["field1"],
    variables: {
      id2: {
        name: "id",
        type: "ID",
        value: 123
      }
    }
  }],
  variables: {
    id1: {
      name: "id",
      type: "ID",
      value: 456
    }
  }
}]);

console.log(query);
```

Output

```js
{
  query: 'query ($id2: ID, $id1: ID) { someoperation (id: $id1) { nestedoperation (id: $id2) { field1 } } }',
  variables: { id1: 456, id2: 123 }
}
```

[↑ all examples](#examples)

#### Query (with operation name):

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery({
  operation: "userLogin",
  fields: ["userId", "token"]
}, null, {
  operationName: "someoperation"
});

console.log(query);
```

Output

```js
{
  query: 'query someoperation { userLogin { userId token } }',
  variables: {}
}
```

[↑ all examples](#examples)

#### Query (with empty fields):

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery([
  {
    operation: "getFilteredUsersCount"
  },
  {
    operation: "getAllUsersCount",
    fields: []
  },
  {
    operation: "getFilteredUsers",
    fields: [{ count: [] }]
  }
]);

console.log(query);
```

Output

```js
{
  query: 'query { getFilteredUsersCount getAllUsersCount getFilteredUsers { count } }',
  variables: {}
}
```

[↑ all examples](#examples)

#### Query (with alias):

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery({
  operation: {
    name: "thoughts",
    alias: "myThoughts"
  },
  fields: ["id", "name", "thought"]
});

console.log(query);
```

Output

```js
{
  query: 'query { myThoughts: thoughts { id name thought } }',
  variables: {}
}
```

[↑ all examples](#examples)

#### Query (with inline fragment):

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery({
  operation: "thought",
  fields: [
    "id",
    "name",
    "thought",
    {
      operation: "FragmentType",
      fields: ["emotion"],
      inlineFragment: true
    }
  ]
});

console.log(query);
```

Output

```js
{
  query: 'query { thought { id name thought ... on FragmentType { emotion } } }',
  variables: {}
}
```

#### Query (with named fragment):

```js
import { gqlQuery } from "gql-payload";

const query = gqlQuery({
  operation: "thought",
  fields: [
    "id",
    "name",
    "thought",
    {
      operation: "FragmentName",
      namedFragment: true
    }
  ]
}, null, {
  fragment: [
    {
      name: "FragmentName",
      on: "FragmentType",
      fields: ["emotion"]
    }
  ]
});

console.log(query);
```

Output

```js
{
  query: 'query { thought { id name thought ...FragmentName } } fragment FragmentName on FragmentType { emotion }',
  variables: {}
}
```

[↑ all examples](#examples)

#### Query (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```js
import { gqlQuery } from "gql-payload";
import MyQueryAdapter from "where/adapters/live/MyQueryAdapter";

const query = gqlQuery({
  operation: "thoughts",
  fields: ["id", "name", "thought"]
}, MyQueryAdapter);

console.log(query);
```

Output

```js
{ 
  query: 'query SomethingIDidInMyAdapter { thoughts { id name thought } }',
  variables: {}
}
```

Take a peek at [DefaultQueryAdapter](src/adapters/DefaultQueryAdapter.ts) to get an understanding of how to make a new adapter.

[↑ all examples](#examples)

#### Mutation:

```js
import { gqlMutation } from "gql-payload";

const mutation = gqlMutation({
  operation: "thoughtCreate",
  variables: {
    name: "Tyrion Lannister",
    thought: "I drink and I know things."
  },
  fields: ["id"]
});

console.log(mutation);
```

Output

```js
{
  query: 'mutation ($name: String, $thought: String) { thoughtCreate (name: $name, thought: $thought) { id } }',
  variables: { name: 'Tyrion Lannister', thought: 'I drink and I know things.' }
}
```

[↑ all examples](#examples)

#### Mutation (with required variables):

```js
import { gqlMutation } from "gql-payload";

const mutation = gqlMutation({
  operation: "userSignup",
  variables: {
    name: { value: "Jon Doe" },
    email: { value: "jon.doe@example.com", required: true },
    password: { value: "123456", required: true }
  },
  fields: ["userId"]
});

console.log(mutation);
```

Output

```js
{
  query: 'mutation ($name: String, $email: String!, $password: String!) { userSignup (name: $name, email: $email, password: $password) { userId } }',
  variables: { name: 'Jon Doe', email: 'jon.doe@example.com', password: '123456' }
}
```

[↑ all examples](#examples)

#### Mutation (with custom types):

```js
import { gqlMutation } from 'gql-payload'

const mutation = gqlMutation({
  operation: "userPhoneNumber",
  variables: {
    phone: {
      value: { prefix: "+91", number: "9876543210" },
      type: "PhoneNumber",
      required: true
    }
  },
  fields: ["id"]
})

console.log(mutation)
```

Output

```js
{
  query: 'mutation ($phone: PhoneNumber!) { userPhoneNumber (phone: $phone) { id } }',
  variables: { phone: { prefix: '+91', number: '9876543210' } }
}
```

[↑ all examples](#examples)

#### Mutation (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```js
import { gqlMutation } from "gql-payload";
import MyMutationAdapter from "where/adapters/live/MyMutationAdapter";

const mutation = gqlMutation({
  operation: "thoughts",
  fields: ["id", "name", "thought"]
}, MyMutationAdapter);

console.log(mutation);
```

Output

```js
{ 
  query: 'mutation SomethingIDidInMyAdapter { thoughts { id name thought } }',
  variables: {}
}
```

[↑ all examples](#examples)

Take a peek at [DefaultMutationAdapter](src/adapters/DefaultMutationAdapter.ts) to get an understanding of how to make a new adapter.

#### Mutation (with operation name):

```js
import { gqlMutation } from "gql-payload";

const mutation = gqlMutation({
  operation: "thoughts",
  fields: ["id", "name", "thought"]
}, undefined, {
  operationName: "someoperation"
});

console.log(mutation);
```

Output

```js
{
  query: 'mutation someoperation { thoughts { id name thought } }',
  variables: {}
}
```

[↑ all examples](#examples)

#### Subscription:

```js
import { gqlSubscription } from "gql-payload";

const subscription = gqlSubscription({
  operation: "thoughtCreate",
  variables: {
    name: "Tyrion Lannister",
    thought: "I drink and I know things."
  },
  fields: ["id"]
});

console.log(subscription);
```

Output

```js
{
  query: 'subscription ($name: String, $thought: String) { thoughtCreate (name: $name, thought: $thought) { id } }',
  variables: { name: 'Tyrion Lannister', thought: 'I drink and I know things.' }
}
```

[↑ all examples](#examples)

#### Subscription (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```js
import { gqlSubscription } from "gql-payload";
import MySubscriptionAdapter from "where/adapters/live/MySubscriptionAdapter";

const subscription = gqlSubscription({
  operation: "thoughts",
  fields: ["id", "name", "thought"]
}, MySubscriptionAdapter);

console.log(subscription);
```

Output

```js
{ 
  query: 'subscription SomethingIDidInMyAdapter { thoughts { id name thought } }',
  variables: {}
}
```

Take a peek at [DefaultSubscriptionAdapter](src/adapters/DefaultSubscriptionAdapter.ts) to get an understanding of how to make a new adapter.

[↑ all examples](#examples)

#### Example with [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)

```js
import { gqlQuery } from "gql-payload";

async function getThoughts () {
  const query = gqlQuery({
    operation: "thoughts",
    fields: ["id", "name", "thought"]
  });

  try {
    const response = await fetch("http://api.example.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(query)
    });
    const data = await response.json();
    console.log(data);
  }
  catch (error) {
    console.log(error);
  }
}
```

[↑ all examples](#examples)

#### Example with [Ofetch](https://github.com/unjs/ofetch)

```js
import { $fetch } from "ofetch";
import { gqlQuery } from "gql-payload";

async function getThoughts () {
  const query = gqlQuery({
    operation: "thoughts",
    fields: ["id", "name", "thought"]
  });

  const data = await $fetch("http://api.example.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: query
  }).catch((error) => console.log(error));

  console.log(data);
}
```

[↑ all examples](#examples)

#### Example with [Axios](https://github.com/axios/axios)

```js
import axios from "axios";
import { gqlQuery } from "gql-payload";

async function getThoughts () {
  try {
    const response = await axios.post(
      "http://api.example.com/graphql",
      gqlQuery({
        operation: "thoughts",
        fields: ["id", "name", "thought"]
      })
    );

    console.log(response);
  }
  catch (error) {
    console.log(error);
  }
}
```

[↑ all examples](#examples)

