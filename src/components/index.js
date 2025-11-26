import Sidebar from "./SideBar";
import NodeDetailsPanel from "./NodeDetailsPanel";
import Toolbar  from "./ToolBar";
import Header from "./Header";  
import AppModal from "./AppModal";

export const componentTypes = {
  sideBar: Sidebar,
  toolBar: Toolbar,
  nodeDetailsPanel: NodeDetailsPanel,
  header: Header,
  appModal: AppModal,
};

export const availablecomponents = [
  { type: "sideBar", label: "Side Bar" },
  { type: "toolBar", label: "Tool Bar" },
  { type: "nodeDetailsPanel", label: "Node Details" },
  { type: "header", label: "Header" },
  { type: "appModal", label: "App Modal" },
];
