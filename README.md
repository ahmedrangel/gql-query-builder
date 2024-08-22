# GraphQL Query Builder

A simple helper function to generate GraphQL queries using plain JavaScript Objects (JSON).

<a href="https://www.npmjs.com/package/gql-query-builder">
<img src="https://img.shields.io/npm/dt/gql-query-builder?label=Downloads" alt="downloads" />
</a>

<a href="https://replit.com/@atulmy/gql-query-builder#index.js">
<img src="https://img.shields.io/badge/Demo-replit-blue" alt="demo" />
</a>

## Install

`npm install gql-query-builder --save` or `yarn add gql-query-builder`

## Usage

```ts
import { gqlQuery, gqlMutation, gqlSubscription } from 'gql-query-builder'

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
      <code>
      {
        email: { value: "user@example.com", required: true },
        password: { value: "123456", required: true },
        secondaryEmails: { value: [], required: false, type: 'String', list: true, name: secondaryEmail }
      }
      </code>
    </td>

  </tr>

  </tbody>
</table>

### Adapter

An optional second argument `adapter` is a typescript/javascript class that implements `IQueryAdapter`, `IMutationAdapter` or `ISubscriptionAdapter`.

If adapter is undefined then `src/adapters/DefaultQueryAdapter` or `src/adapters/DefaultMutationAdapter` is used.

```ts
import { gqlQuery } as gql from 'gql-query-builder'

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
    <td>Reusable named fragment fields to be sent to the server</td>
    <td>Array</td>
    <td>No</td>
    <td>
      [{
        name: "NamedFragment",
        on: "User",
        fields: ["grade"]
      }]
    </td>
  </tr>
  </tbody>
</table>

## Examples

1. <a href="#query">Query</a>
2. <a href="#query-with-variables">Query (with variables)</a>
3. <a href="#query-with-nested-fields-selection">Query (with nested fields selection)</a>
4. <a href="#query-with-required-variables">Query (with required variables)</a>
5. <a href="#query-with-custom-argument-name">Query (with custom argument name)</a>
6. <a href="#query-with-operation-name">Query (with operation name)</a>
7. <a href="#query-with-empty-fields">Query (with empty fields)</a>
8. <a href="#query-with-alias">Query (with alias)</a>
9. <a href="#query-with-adapter-defined">Query (with adapter defined)</a>
10. <a href="#mutation">Mutation</a>
11. <a href="#mutation-with-required-variables">Mutation (with required variables)</a>
12. <a href="#mutation-with-custom-types">Mutation (with custom types)</a>
13. <a href="#mutation-with-adapter-defined">Mutation (with adapter defined)</a>
14. <a href="#mutation-with-operation-name">Mutation (with operation name)</a>
15. <a href="#subscription">Subscription</a>
16. <a href="#subscription-with-adapter-defined">Subscription (with adapter defined)</a>
17. <a href="#example-with-axios">Example with Axios</a>

#### Query:

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
})

console.log(query)

// Output
query {
  thoughts {
    id
    name
    thought
  }
}
```

[↑ all examples](#examples)

#### Query (with variables):

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery({
  operation: 'thought',
  variables: { id: 1 },
  fields: ['id', 'name', 'thought']
})

console.log(query)

// Output
query ($id: Int) {
  thought (id: $id) {
    id
    name
    thought
  }
}

// Variables
{ "id": 1 }
```

[↑ all examples](#examples)

#### Query (with nested fields selection):

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery({
  operation: 'orders',
  fields: [
    'id',
    'amount',
    {
     user: [
        'id',
        'name',
        'email',
        {
          address: [
            'city',
            'country'
          ]
        }
      ]
    }
  ]
})

console.log(query)

// Output
query {
  orders  {
    id
    amount
    user {
      id
      name
      email
      address {
        city
        country
      }
    }
  }
}
```

[↑ all examples](#examples)

#### Query (with required variables):

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery({
  operation: 'userLogin',
  variables: {
    email: { value: 'jon.doe@example.com', required: true },
    password: { value: '123456', required: true }
  },
  fields: ['userId', 'token']
})

console.log(query)

// Output
query ($email: String!, $password: String!) {
  userLogin (email: $email, password: $password) {
    userId
    token
  }
}

// Variables
{
  email: "jon.doe@example.com",
  password: "123456"
}
```

[↑ all examples](#examples)

#### Query (with custom argument name):

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery([{
  operation: "someoperation",
  fields: [{
    operation: "nestedoperation",
    fields: ["field1"],
    variables: {
      id2: {
        name: "id",
        type: "ID",
        value: 123,
      },
    },
  }, ],
  variables: {
    id1: {
      name: "id",
      type: "ID",
      value: 456,
    },
  },
}, ]);

console.log(query)

// Output
query($id2: ID, $id1: ID) {
  someoperation(id: $id1) {
    nestedoperation(id: $id2) {
      field1
    }
  }
}

// Variables
{
  "id1": 1,
  "id2": 1
}
```

[↑ all examples](#examples)

#### Query (with operation name):

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery({
  operation: 'userLogin',
  fields: ['userId', 'token']
}, null, {
  operationName: 'someoperation'
})

console.log(query)

// Output
query someoperation {
  userLogin {
    userId
    token
  }
}
```

[↑ all examples](#examples)

#### Query (with empty fields):

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery([{
  operation: "getFilteredUsersCount",
},
  {
    operation: "getAllUsersCount",
    fields: []
  },
  operation: "getFilteredUsers",
  fields: [{
  count: [],
}, ],
]);

console.log(query)

// Output
query {
  getFilteredUsersCount
  getAllUsersCount
  getFilteredUsers {
    count
  }
}
```

[↑ all examples](#examples)

#### Query (with alias):

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery({
  operation: {
    name: 'thoughts',
    alias: 'myThoughts',
  },
  fields: ['id', 'name', 'thought']
})

console.log(query)

// Output
query {
  myThoughts: thoughts {
    id
    name
    thought
  }
}
```

[↑ all examples](#examples)

#### Query (with inline fragment):

```js
import { gqlQuery } from 'gql-query-builder'

const query = gqlQuery({
    operation: "thought",
    fields: [
        "id",
        "name",
        "thought",
        {
          operation: "FragmentType",
          fields: ["emotion"],
          fragment: true,
        },
    ],
});

console.log(query)

// Output
query {
    thought {
        id
        name
        thought
        ... on FragmentType {
          emotion
        }
    }
}
```

[↑ all examples](#examples)

#### Query (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```js
import { gqlQuery } from 'gql-query-builder'
import MyQueryAdapter from 'where/adapters/live/MyQueryAdapter'

const query = gqlQuery({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}, MyQueryAdapter)

console.log(query)

// Output
query SomethingIDidInMyAdapter {
  thoughts {
    id
    name
    thought
  }
}
```

Take a peek at [DefaultQueryAdapter](src/adapters/DefaultQueryAdapter.ts) to get an understanding of how to make a new adapter.

[↑ all examples](#examples)

#### Mutation:

```js
import { gqlMutation } from 'gql-query-builder'

const query = gqlMutation({
  operation: 'thoughtCreate',
  variables: {
    name: 'Tyrion Lannister',
    thought: 'I drink and I know things.'
  },
  fields: ['id']
})

console.log(query)

// Output
mutation ($name: String, $thought: String) {
  thoughtCreate (name: $name, thought: $thought) {
    id
  }
}

// Variables
{
  "name": "Tyrion Lannister",
  "thought": "I drink and I know things."
}
```

[↑ all examples](#examples)

#### Mutation (with required variables):

```js
import { gqlMutation } from 'gql-query-builder'

const query = gqlMutation({
  operation: 'userSignup',
  variables: {
    name: { value: 'Jon Doe' },
    email: { value: 'jon.doe@example.com', required: true },
    password: { value: '123456', required: true }
  },
  fields: ['userId']
})

console.log(query)

// Output
mutation ($name: String, $email: String!, $password: String!) {
  userSignup (name: $name, email: $email, password: $password) {
    userId
  }
}

// Variables
{
  name: "Jon Doe",
  email: "jon.doe@example.com",
  password: "123456"
}
```

[↑ all examples](#examples)

#### Mutation (with custom types):

```js
import { gqlMutation } from 'gql-query-builder'

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
})

console.log(query)

// Output
mutation ($phone: PhoneNumber!) {
  userPhoneNumber (phone: $phone) {
    id
  }
}

// Variables
{
  phone: {
    prefix: "+91", number: "9876543210"
  }
}
```

[↑ all examples](#examples)

#### Mutation (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```js
import { gqlMutation } from 'gql-query-builder'
import MyMutationAdapter from 'where/adapters/live/MyQueryAdapter'

const query = gqlMutation({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}, MyMutationAdapter)

console.log(query)

// Output
mutation SomethingIDidInMyAdapter {
  thoughts {
    id
    name
    thought
  }
}
```

[↑ all examples](#examples)

Take a peek at [DefaultMutationAdapter](src/adapters/DefaultMutationAdapter.ts) to get an understanding of how to make a new adapter.

#### Mutation (with operation name):

```js
import { gqlMutation } from 'gql-query-builder'

const query = gqlMutation({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}, undefined, {
  operationName: 'someoperation'
})

console.log(query)

// Output
mutation someoperation {
  thoughts {
    id
    name
    thought
  }
}
```

[↑ all examples](#examples)

#### Subscription:

```js
import axios from "axios";
import { gqlSubscription } from 'gql-query-builder'

async function saveThought() {
  try {
    const response = await axios.post(
      "http://api.example.com/graphql",
      gqlSubscription({
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things.",
        },
        fields: ["id"],
      })
    );

    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
```

[↑ all examples](#examples)

#### Subscription (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```js
import { gqlSubscription } from 'gql-query-builder'
import MySubscriptionAdapter from 'where/adapters/live/MyQueryAdapter'

const query = gqlSubscription({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}, MySubscriptionAdapter)

console.log(query)

// Output
subscription SomethingIDidInMyAdapter {
  thoughts {
    id,
    name,
    thought
  }
}
```

Take a peek at [DefaultSubscriptionAdapter](src/adapters/DefaultSubscriptionAdapter.ts) to get an understanding of how to make a new adapter.

[↑ all examples](#examples)

#### Example with [Axios](https://github.com/axios/axios)

**Query:**

```js
import axios from "axios";
import { gqlQuery } from 'gql-query-builder'

async function getThoughts() {
  try {
    const response = await axios.post(
      "http://api.example.com/graphql",
      gqlQuery({
        operation: "thoughts",
        fields: ["id", "name", "thought"],
      })
    );

    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
```

[↑ all examples](#examples)

**Mutation:**

```js
import axios from "axios";
import { gqlMutation } from 'gql-query-builder'

async function saveThought() {
  try {
    const response = await axios.post(
      "http://api.example.com/graphql",
      gqlMutation({
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things.",
        },
        fields: ["id"],
      })
    );

    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
```

[↑ all examples](#examples)
