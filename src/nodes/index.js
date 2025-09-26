import CustomNode1 from "./CustomNode1";
import CustomNode2 from "./CustomNode2";

export const nodeTypes = {
  customNode1: CustomNode1,
  customNode2: CustomNode2,
};

export const availableNodes = [
  { type: "customNode1", label: "Dropdown Node" },
  { type: "customNode2", label: "Text+Checkbox Node" },
];
