import { Fields, IQueryBuilderOptions, NestedField, VariableOptions } from "../types";

/*
Defines an array of strings or objects to define query fields
@example ['id', 'name']
@example [{id: 1, name: 'Chuck'}]
 */
export const isNestedField = (object: any): object is NestedField => {
  return (
    (typeof object === "object" &&
      object.hasOwnProperty("operation") &&
      object.hasOwnProperty("variables") &&
      object.hasOwnProperty("fields")) ||
    (typeof object === "object" &&
      object.hasOwnProperty("operation") &&
      object.hasOwnProperty("fragment") &&
      object.hasOwnProperty("fields"))
  );
};


export const resolveVariables = (operations: IQueryBuilderOptions[]): any => {
  let ret: any = {};

  for (const { variables, fields } of operations) {
    ret = {
      ...ret,
      ...variables,
      ...((fields && getNestedVariables(fields)) || {})
    };
  }
  return ret;
};

export const getNestedVariables = (fields: Fields) => {
  let variables = {};
  const getDeepestVariables = (innerFields: Fields) => {
    innerFields?.forEach((field: string | object | NestedField) => {
      if (isNestedField(field)) {
        variables = {
          ...field.variables,
          ...variables,
          ...(field.fields && getDeepestVariables(field.fields))
        };
      }
      else {
        if (typeof field === "object") {
          for (const [, value] of Object.entries(field)) {
            getDeepestVariables(value);
          }
        }
      }
    });

    return variables;
  };
  getDeepestVariables(fields);
  return variables;
};

// Convert object to name and argument map. eg: (id: $id)
export const queryDataNameAndArgumentMap = (variables: VariableOptions) => {
  return variables && Object.keys(variables).length? `(${Object.entries(variables).reduce((dataString, [key, value], i) => {
    return `${dataString}${i !== 0 ? ", " : ""}${
      value && value.name ? value.name : key
    }: $${key}`;
  }, "")})`: "";
};

export const queryFieldsMap = (fields?: Fields): string => {
  return fields ? fields.map((field) => {
    if (isNestedField(field)) {
      return queryNestedFieldMap(field);
    }
    else if (typeof field === "object") {
      let result = "";
      Object.entries<Fields>(field as Record<string, Fields>).forEach(
        ([key, values], index, array) => {
          result += `${key} ${
            values.length > 0? "{ " + queryFieldsMap(values) + " }": ""
          }`;
          // If it's not the last item in array, join with comma
          if (index < array.length - 1) {
            result += ", ";
          }
        }
      );
      return result;
    }
    else {
      return `${field}`;
    }
  }).join(", ") : "";
};

export const queryNestedFieldMap = (field: NestedField) => {
  return `${getFragment(field)}${operationOrFragment(field)} ${
    isFragment(field)? "": queryDataNameAndArgumentMap(field.variables)
  } ${
    field.fields.length > 0? "{ " + queryFieldsMap(field.fields) + " }": ""
  }`;
};

export const operationOrAlias = (
  operation: IQueryBuilderOptions["operation"]
): string => {
  return typeof operation === "string"? operation: `${operation.alias}: ${operation.name}`;
};

export const isFragment = (field: NestedField): boolean => {
  return field?.fragment === true ?? false;
};

export const operationOrFragment = (field: NestedField): string => {
  return isFragment(field)? field.operation: operationOrAlias(field.operation);
};

export const getFragment = (field: NestedField): string => {
  return isFragment(field) ? "... on " : "";
};

// Variables map. eg: { "id": 1, "name": "Jon Doe" }
export const queryVariablesMap = (variables: any, fields?: Fields) => {
  const variablesMapped: { [key: string]: unknown } = {};
  const update = (vars: any) => {
    if (vars) {
      Object.keys(vars).map((key) => {
        variablesMapped[key] =
          typeof vars[key] === "object" ? vars[key].value : vars[key];
      });
    }
  };
  update(variables);
  if (fields && typeof fields === "object") {
    update(getNestedVariables(fields));
  }
  return variablesMapped;
};

export const queryDataType = (variable: any) => {
  let type = "String";

  const value = typeof variable === "object" ? variable.value : variable;

  if (variable?.type != null) {
    type = variable.type;
  }
  else {
    // TODO: Should handle the undefined value (either in array value or single value)
    const candidateValue = Array.isArray(value) ? value[0] : value;
    switch (typeof candidateValue) {
      case "object":
        type = "Object";
        break;

      case "boolean":
        type = "Boolean";
        break;

      case "number":
        type = candidateValue % 1 === 0 ? "Int" : "Float";
        break;
    }
  }

  // set object based variable properties
  if (typeof variable === "object") {
    if (variable.list === true) {
      type = `[${type}]`;
    }
    else if (Array.isArray(variable.list)) {
      type = `[${type}${variable.list[0] ? "!" : ""}]`;
    }

    if (variable.required) {
      type += "!";
    }
  }

  return type;
};
