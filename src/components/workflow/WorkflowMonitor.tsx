import { useEffect, useState } from "react";
import {
  WorkflowSocket,
  type WorkflowEvent,
} from "../../services/workflowSocket";

interface WorkflowMonitorProps {
  workflowId?: string;
}

export function WorkflowMonitor({ workflowId }: WorkflowMonitorProps) {
  const [events, setEvents] = useState<WorkflowEvent[]>([]);

  useEffect(() => {
    setEvents([]);

    if (!workflowId) return;

    const socket = new WorkflowSocket(workflowId, (event) => {
      setEvents((previous) => [...previous, event]);
    });

    socket.connect();

    return () => socket.disconnect();
  }, [workflowId]);

  if (!workflowId) {
    return <div className="workflow-monitor-empty">No active workflow</div>;
  }

  return (
    <div className="workflow-monitor" aria-live="polite">
      {events.length === 0 ? (
        <div className="workflow-monitor-empty">Waiting for workflow events...</div>
      ) : (
        events.map((event, index) => (
          <div className="workflow-event" key={`${event.timestamp}-${index}`}>
            <strong>{event.type}</strong>
            {event.nodeId && <span>{event.nodeId}</span>}
            {event.message && <span>: {event.message}</span>}
          </div>
        ))
      )}
    </div>
  );
}