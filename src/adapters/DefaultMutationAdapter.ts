/*
@class DefaultMutationAdapter
@desc A basic implementation to use
@desc modify the output of the mutation template by passing a second argument to mutation(options, AdapterClass)
 */
import type { IQueryBuilderOptions, IOperation, Fields, IMutationAdapter, Config } from "../types";
import { OperationType } from "../enums";
import { getNestedVariables, queryDataNameAndArgumentMap, queryDataType, queryFieldsMap, queryVariablesMap, resolveVariables } from "../utils/helpers";

export default class DefaultMutationAdapter implements IMutationAdapter {
  private variables: any | undefined;
  private fields: Fields | undefined;
  private operation!: string | IOperation;
  private config: Config | undefined;

  constructor (
    options: IQueryBuilderOptions | IQueryBuilderOptions[],
    configuration?: { [key: string]: unknown }
  ) {
    if (Array.isArray(options)) {
      this.variables = resolveVariables(options);
    }
    else {
      this.variables = options.variables;
      this.fields = options.fields;
      this.operation = options.operation;
    }

    // Default configs
    this.config = {
      operationName: null,
      fragment: null
    };
    if (configuration) {
      for (const [key, value] of Object.entries(configuration)) {
        this.config[key] = value;
      }
    }
  }

  public mutationBuilder () {
    return this.operationWrapperTemplate(this.variables, this.operationTemplate(this.operation));
  }

  public mutationsBuilder (mutations: IQueryBuilderOptions[]) {
    const content = mutations.map((opts) => {
      this.operation = opts.operation;
      this.variables = opts.variables;
      this.fields = opts.fields;
      return this.operationTemplate(opts.operation);
    });
    return this.operationWrapperTemplate(resolveVariables(mutations), content.join("\n  "));
  }

  private queryDataArgumentAndTypeMap (variablesUsed: any): string {
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

  // start of mutation building
  private operationWrapperTemplate (variables: any, content: string) {
    let query = `${OperationType.Mutation} ${this.queryDataArgumentAndTypeMap(variables)} { ${content} }`;

    if (this.config.operationName) {
      query = query.replace("mutation", `mutation ${this.config.operationName}`);
    }

    if (this.config.fragment && Array.isArray(this.config.fragment)) {
      const fragmentsArray = [];
      for (const fragment of this.config.fragment) {
        fragmentsArray.push(`fragment ${fragment.name} on ${fragment.on} { ${queryFieldsMap(fragment.fields)} }`);
      }
      query = `${query} ${fragmentsArray.join(" ")}`;
    }

    return {
      query: query.replace(/\n+/g, "").replace(/ +/g, " "),
      variables: queryVariablesMap(variables, this.fields)
    };
  }

  private operationTemplate (operation: string | IOperation) {
    const operationName =
      typeof operation === "string"? operation: `${operation.alias}: ${operation.name}`;

    return `${operationName} ${queryDataNameAndArgumentMap(this.variables)} ${
      this.fields && this.fields.length > 0 ? `{ ${queryFieldsMap(this.fields)} }`: ""
    }`;
  }
}
