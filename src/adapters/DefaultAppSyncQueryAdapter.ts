/*
@class DefaultAppSyncQueryAdapter
@desc A basic implementation to use with AWS AppSync
@desc modify the output of the query template by passing a second argument to query(options, DefaultAppSyncQueryAdapter)
 */
import type { IQueryBuilderOptions, IOperation, Fields, IQueryAdapter } from "../types";
import { OperationType } from "../enums";
import { resolveVariables, queryVariablesMap, queryFieldsMap } from "../utils/helpers";

export default class DefaultAppSyncQueryAdapter implements IQueryAdapter {
  private variables!: any | undefined;
  private fields: Fields | undefined;
  private operation!: string | IOperation;

  constructor (options: IQueryBuilderOptions | IQueryBuilderOptions[]) {
    if (Array.isArray(options)) {
      this.variables = resolveVariables(options);
    }
    else {
      this.variables = options.variables;
      this.fields = options.fields || [];
      this.operation = options.operation;
    }
  }
  // kicks off building for a single query
  public queryBuilder () {
    return this.operationWrapperTemplate(this.operationTemplate());
  }
  // if we have an array of options, call this
  public queriesBuilder (queries: IQueryBuilderOptions[]) {
    const content = () => {
      const tmpl: string[] = [];
      for (const query of queries) {
        if (query) {
          this.operation = query.operation;
          this.fields = query.fields;
          this.variables = query.variables;
          tmpl.push(this.operationTemplate());
        }
      }
      return tmpl.join(" ");
    };
    return this.operationWrapperTemplate(content());
  }

  // Convert object to name and argument map. eg: (id: $id)
  public queryDataNameAndArgumentMap () {
    return this.variables && Object.keys(this.variables).length? `(${Object.keys(this.variables).reduce(
      (dataString, key, i) =>
        `${dataString}${i !== 0 ? ", " : ""}${key}: $${key}`,
      ""
    )})`: "";
  }

  // Convert object to argument and type map. eg: ($id: Int)
  private queryDataArgumentAndTypeMap (): string {
    return this.variables && Object.keys(this.variables).length? `(${Object.keys(this.variables).reduce(
      (dataString, key, i) =>
        `${dataString}${i !== 0 ? ", " : ""}$${key}: ${this.queryDataType(
          this.variables[key]
        )}`,
      ""
    )})`: "";
  }

  private queryDataType = (variable: any) => {
    let type = "String";

    const value = typeof variable === "object" ? variable.value : variable;

    if (variable.type !== undefined) {
      type = variable.type;
    }
    else {
      switch (typeof value) {
        case "object":
          type = "Object";
          break;

        case "boolean":
          type = "Boolean";
          break;

        case "number":
          type = value % 1 === 0 ? "Int" : "Float";
          break;
      }
    }

    if (typeof variable === "object" && variable.required) {
      type += "!";
    }

    return type;
  };

  private operationWrapperTemplate (content: string): {
    variables: { [p: string]: unknown };
    query: string;
  } {
    const operation =
      typeof this.operation === "string" ? this.operation : this.operation.name;

    return {
      query: `${OperationType.Query} ${operation
        .charAt(0)
        .toUpperCase()}${operation.slice(
        1
      )} ${this.queryDataArgumentAndTypeMap()} { ${content} }`.replace(/\n+/g, "").replace(/ +/g, " "),
      variables: queryVariablesMap(this.variables)
    };
  }
  // query
  private operationTemplate () {
    const operation =
      typeof this.operation === "string"? this.operation: `${this.operation.alias}: ${this.operation.name}`;

    return `${operation} ${this.queryDataNameAndArgumentMap()} { nodes { ${queryFieldsMap(this.fields)} } }`;
  }
}
