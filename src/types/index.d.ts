export interface Variables {
  type?: string;
  name?: string;
  value: any;
  list?: boolean | [boolean];
  required?: boolean;
}

export type VariableOptions = Variables | { [k: string]: any };

export interface IOperation {
  name: string;
  alias: string;
}

export interface Fields extends Array<string | object | NestedField> {}

export interface IQueryBuilderOptions {
  operation: string | IOperation /* Operation name */;
  fields?: Fields /* Selection of fields to be returned by the operation */;
  variables?: VariableOptions;
  /* VariableOptions Interface or regular single key object */
}

export interface NestedField {
  operation: string;
  variables: IQueryBuilderOptions[];
  fields: Fields;
  fragment?: boolean | null;
}

export interface IMutationAdapter {
  mutationBuilder: () => { variables: any, query: string };
  mutationsBuilder: (options: IQueryBuilderOptions[]) => {
    variables: any;
    query: string;
  };
}

export interface IQueryAdapter {
  queryBuilder: () => { variables: any, query: string };
  queriesBuilder: (options: IQueryBuilderOptions[]) => {
    variables: any;
    query: string;
  };
}

export interface ISubscriptionAdapter {
  subscriptionBuilder: () => { variables: any, query: string };
  subscriptionsBuilder: (options: IQueryBuilderOptions[]) => {
    variables: any;
    query: string;
  };
}
