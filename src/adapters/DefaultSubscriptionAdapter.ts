/*
@class DefaultMutationAdapter
@desc A basic implementation to use
@desc modify the output of the subscription template by passing a second argument to subscription(options, AdapterClass)
 */
import type { IQueryBuilderOptions, IOperation, Fields, ISubscriptionAdapter } from "../types";
import { OperationType } from "../enums";
import { queryDataType, queryVariablesMap, resolveVariables } from "../utils/helpers";

export default class DefaultSubscriptionAdapter
implements ISubscriptionAdapter {
  private variables: any | undefined;
  private fields: Fields | undefined;
  private operation!: string | IOperation;

  constructor (options: IQueryBuilderOptions | IQueryBuilderOptions[]) {
    if (Array.isArray(options)) {
      this.variables = resolveVariables(options);
    }
    else {
      this.variables = options.variables;
      this.fields = options.fields;
      this.operation = options.operation;
    }
  }

  public subscriptionBuilder () {
    return this.operationWrapperTemplate(
      this.variables,
      this.operationTemplate(this.operation)
    );
  }

  public subscriptionsBuilder (subscriptions: IQueryBuilderOptions[]) {
    const content = subscriptions.map((opts) => {
      this.operation = opts.operation;
      this.variables = opts.variables;
      this.fields = opts.fields;
      return this.operationTemplate(opts.operation);
    });
    return this.operationWrapperTemplate(
      resolveVariables(subscriptions),
      content.join("\n  ")
    );
  }
  // Convert object to name and argument map. eg: (id: $id)
  private queryDataNameAndArgumentMap () {
    return this.variables && Object.keys(this.variables).length? `(${Object.keys(this.variables).reduce(
      (dataString, key, i) =>
        `${dataString}${i !== 0 ? ", " : ""}${key}: $${key}`,
      ""
    )})`: "";
  }

  private queryDataArgumentAndTypeMap (variables: any): string {
    return Object.keys(variables).length? `(${Object.keys(variables).reduce(
      (dataString, key, i) =>
        `${dataString}${i !== 0 ? ", " : ""}$${key}: ${queryDataType(
          variables[key]
        )}`,
      ""
    )})`: "";
  }

  // start of subscription building
  private operationWrapperTemplate (variables: any, content: string) {
    return {
      query: `${OperationType.Subscription} ${this.queryDataArgumentAndTypeMap(variables)} { ${content} }`.replace(/\n+/g, "").replace(/ +/g, " "),
      variables: queryVariablesMap(variables)
    };
  }

  private operationTemplate (operation: string | IOperation) {
    const operationName =
      typeof this.operation === "string"? this.operation: `${this.operation.alias}: ${this.operation.name}`;

    return `${operationName} ${this.queryDataNameAndArgumentMap()} {
    ${this.queryFieldsMap(this.fields)}
  }`;
  }

  // Fields selection map. eg: { id, name }
  private queryFieldsMap (fields?: Fields): string {
    return fields? fields
      .map((field) =>
        typeof field === "object"? `${Object.keys(field)[0]} { ${this.queryFieldsMap(
          Object.values(field)[0]
        )} }`: `${field}`
      )
      .join(", "): "";
  }
}
