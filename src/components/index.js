import Sidebar from "./SideBar";
import NodeDetailsPanel from "./NodeDetailsPanel";
import Toolbar  from "./ToolBar";
import Header from "./Header";  

export const componentTypes = {
  sideBar: Sidebar,
  toolBar: Toolbar,
  nodeDetailsPanel: NodeDetailsPanel,
  header: Header,
};

export const availablecomponents = [
  { type: "sideBar", label: "Side Bar" },
  { type: "toolBar", label: "Tool Bar" },
  { type: "nodeDetailsPanel", label: "Node Details" },
  { type: "header", label: "Header" },
];
