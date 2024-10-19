import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
} from "graphql";

const mockWidgets = [
  { id: 1, name: "Widget 1" },
  { id: 2, name: "Widget 2" },
];

const Widget = new GraphQLObjectType({
  name: "Widget",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    timer: {
      type: GraphQLString,
      resolve: async () => {
        return new Promise((resolve) =>
          setTimeout(() => resolve("Timer done"), 1000)
        );
      },
    },
  },
});

const CreateWidget = new GraphQLObjectType({
  name: "CreateWidget",
  fields: {
    createWidget: {
      type: Widget,
      args: {
        name: { type: GraphQLString },
      },
      resolve: (_, { name }) => {
        const widget = { id: mockWidgets.length + 1, name };
        mockWidgets.push(widget);
        return widget;
      },
    },
  },
});

const ListWidgets = new GraphQLObjectType({
  name: "ListWidgets",
  fields: {
    widgets: {
      type: new GraphQLList(Widget),
      resolve: () => mockWidgets,
    },
  },
});

const schema = new GraphQLSchema({
  query: ListWidgets,
  mutation: CreateWidget,
});

export { schema };
