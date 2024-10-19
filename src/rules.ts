import {
  GraphQLError,
  FieldNode,
  ValidationContext,
  ASTVisitor,
  SelectionSetNode,
} from "graphql";

interface LimitFieldsOptions {
  n?: number;
  errorMessage?: string;
  exposeLimits?: boolean;
}

const limitFieldsDefaultOptions: Required<LimitFieldsOptions> = {
  n: 10,
  errorMessage: "Query validation error.",
  exposeLimits: true,
};

class LimitFieldsVisitor {
  private readonly context: ValidationContext;
  private readonly config: Required<LimitFieldsOptions>;

  constructor(context: ValidationContext, options?: LimitFieldsOptions) {
    this.context = context;
    this.config = Object.assign({}, limitFieldsDefaultOptions, options);
  }

  getFieldName(fieldNode: FieldNode): string {
    return fieldNode.alias?.value || fieldNode.name.value;
  }

  SelectionSet(node: SelectionSetNode) {
    const fieldCountMap: Record<string, number> = {};

    node.selections.forEach((selection) => {
      if (selection.kind === "Field") {
        const fieldName = this.getFieldName(selection);
        fieldCountMap[fieldName] = (fieldCountMap[fieldName] || 0) + 1;
      }
    });

    const duplicateFields = Object.keys(fieldCountMap).filter(
      (fieldName) => fieldCountMap[fieldName] > this.config.n
    );

    if (duplicateFields.length > 0) {
      const message = this.config.exposeLimits
        ? `Max duplicate fields exceeded: ${this.config.n}`
        : this.config.errorMessage;
      throw new GraphQLError(message);
    }
  }
}

const limitFieldsRule =
  (options?: LimitFieldsOptions) =>
  (context: ValidationContext): ASTVisitor => {
    return new LimitFieldsVisitor(context, options);
  };

export { limitFieldsRule };
