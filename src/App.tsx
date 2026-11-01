import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { Workspace } from "./pages/workspace";
import { Workflow } from "./pages/workflow";

export default function App() {
  const [workflowPageOpen, setWorkflowPageOpen] = useState(false);

  return workflowPageOpen ? (
    <ReactFlowProvider>
      <Workflow />
    </ReactFlowProvider>
  ) : (
    <Workspace onOpenWorkflowPage={() => setWorkflowPageOpen(true)} />
  );
}
