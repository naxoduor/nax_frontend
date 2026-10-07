import { useEffect, useState } from "react";
import {
  WorkflowSocket,
  type WorkflowEvent,
} from "../../services/workflowSocket";

interface WorkflowMonitorProps {
  workflowId?: string;
  onEvent?: (event: WorkflowEvent) => void;
  onFileEventClick?: (event: WorkflowEvent) => void;
}

export function WorkflowMonitor({
  workflowId,
  onEvent,
  onFileEventClick,
}: WorkflowMonitorProps) {
  const [events, setEvents] = useState<WorkflowEvent[]>([]);

  useEffect(() => {
    setEvents([]);

    if (!workflowId) {
      console.warn("Workflow WebSocket not started: workflowId is missing");
      return;
    }

    console.log(`Starting workflow WebSocket monitor for ${workflowId}`);

    const socket = new WorkflowSocket(workflowId, (event) => {
      setEvents((previous) => [...previous, event]);
      onEvent?.(event);
    });

    socket.connect();

    return () => socket.disconnect();
  }, [onEvent, workflowId]);

  if (!workflowId) {
    return <div className="workflow-monitor-empty">No active workflow</div>;
  }

  return (
    <div className="workflow-monitor" aria-live="polite">
      {events.length === 0 ? (
        <div className="workflow-monitor-empty">Waiting for workflow events...</div>
      ) : (
        events.map((event, index) => (
          <div
            className="workflow-event"
            key={`${event.timestamp}-${index}`}
            onClick={() => onFileEventClick?.(event)}
            role={onFileEventClick ? "button" : undefined}
            tabIndex={onFileEventClick ? 0 : undefined}
          >
            <strong>{event.type}</strong>
            {event.nodeId && <span>{event.nodeId}</span>}
            {event.message && <span>: {event.message}</span>}
          </div>
        ))
      )}
    </div>
  );
}