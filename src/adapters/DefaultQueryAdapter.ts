/*
@class DefaultQueryAdapter
@desc A basic implementation to use
@desc modify the output of the query template by passing a second argument to query(options, AdapterClass)
 */
import type { VariableOptions, IQueryBuilderOptions, IOperation, Fields, IQueryAdapter, Config } from "../types";
import { OperationType } from "../enums";
import { getNestedVariables, queryDataNameAndArgumentMap, queryDataType, queryFieldsMap, queryVariablesMap, resolveVariables } from "../utils/helpers";

export default class DefaultQueryAdapter implements IQueryAdapter {
  private variables!: any | undefined;
  private fields: Fields | undefined;
  private operation!: string | IOperation;
  private config: Config | undefined;

  constructor (
    options: IQueryBuilderOptions | IQueryBuilderOptions[],
    configuration?: { [key: string]: any }
  ) {
    // Default configs
    this.config = {
      operationName: null,
      fragment: null
    };
    if (configuration) {
      Object.entries(configuration).forEach(([key, value]) => {
        this.config[key] = value;
      });
    }

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
    return this.operationWrapperTemplate(
      this.operationTemplate(this.variables)
    );
  }
  // if we have an array of options, call this
  public queriesBuilder (queries: IQueryBuilderOptions[]) {
    const content = () => {
      const tmpl: string[] = [];
      queries.forEach((query) => {
        if (query) {
          this.operation = query.operation;
          this.fields = query.fields;
          tmpl.push(this.operationTemplate(query.variables));
        }
      });
      return tmpl.join(" ");
    };
    return this.operationWrapperTemplate(content());
  }

  // Convert object to argument and type map. eg: ($id: Int)
  private queryDataArgumentAndTypeMap (): string {
    let variablesUsed: { [key: string]: unknown } = this.variables;

    if (this.fields && typeof this.fields === "object") {
      variablesUsed = {
        ...getNestedVariables(this.fields),
        ...variablesUsed
      };
    }
    return variablesUsed && Object.keys(variablesUsed).length > 0? `(${Object.keys(variablesUsed).reduce(
      (dataString, key, i) =>
        `${dataString}${i !== 0 ? ", " : ""}$${key}: ${queryDataType(
          variablesUsed[key]
        )}`,
      ""
    )})`: "";
  }

  private operationWrapperTemplate (content: string): {
    variables: { [p: string]: unknown };
    query: string;
  } {
    let query = `${
      OperationType.Query
    } ${this.queryDataArgumentAndTypeMap()} { ${content} }`;
    const fragmentsArray = [];

    if (Array.isArray(this.config.fragment)) {
      for (const fragment of this.config.fragment)
        fragmentsArray.push(`fragment ${fragment.name} on ${fragment.on} { ${queryFieldsMap(fragment.fields)} }`);
    }
    query = fragmentsArray.length ? `${query} ${fragmentsArray.join(" ")}` : query;
    query = query.replace(
      "query",
      `query${
        this.config.operationName ? " " + this.config.operationName : ""
      }`
    );
    return {
      query: query.replace(/\n+/g, "").replace(/ +/g, " "),
      variables: queryVariablesMap(this.variables, this.fields)
    };
  }
  // query
  private operationTemplate (variables: VariableOptions | undefined) {
    const operation =
      typeof this.operation === "string"? this.operation: `${this.operation.alias}: ${this.operation.name}`;

    return `${operation} ${
      variables ? queryDataNameAndArgumentMap(variables) : ""
    } ${
      this.fields && this.fields.length > 0? "{ " + queryFieldsMap(this.fields) + " }": ""
    }`;
  }
}
