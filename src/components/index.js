import Sidebar from "./SideBar";
import NodeDetailsPanel from "./NodeDetailsPanel";

export const componentTypes = {
  sideBar: Sidebar,
  nodeDetailsPanel: NodeDetailsPanel,
};

export const availablecomponents = [
  { type: "sideBar", label: "Side Bar" },
  { type: "nodeDetailsPanel", label: "Node Details" },
];
