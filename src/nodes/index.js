// src/nodes.js

import CustomNode from "./CustomNode";
import DatabaseSchemaNode from "./DatabaseSchemaNode";

export const nodeTypes = {

  customNode: CustomNode, // new dynamic renderer
  databaseSchema: DatabaseSchemaNode,
};

// Default built-in nodes
export const availableNodes = [
  {
    id: "database-schema-default",
    type: "databaseSchema",
    label: "Database Schema",
    data: {
      label: "New Table",
      color: "#eef",
      columns: [
        { id: "col-1", name: "id", type: "int", isPrimaryKey: true },
        { id: "col-2", name: "username", type: "varchar" },
        { id: "col-3", name: "email", type: "varchar" },
      ],
    },
  },
];
