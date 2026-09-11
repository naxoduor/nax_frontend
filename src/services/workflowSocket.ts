import { Client, type IMessage } from "@stomp/stompjs";

export interface WorkflowEvent {
  type: string;
  workflowId: string;
  nodeId?: string;
  portId?: string;
  data?: unknown;
  message?: string;
  timestamp: string;
}

export class WorkflowSocket {
  private readonly client: Client;

  constructor(
    private readonly workflowId: string,
    private readonly onEvent: (event: WorkflowEvent) => void,
  ) {
    this.client = new Client({
      brokerURL: import.meta.env.VITE_WORKFLOW_WS_URL ?? "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to workflow WebSocket");
        this.subscribe();
      },
      onDisconnect: () => {
        console.log("Disconnected from workflow WebSocket");
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });
  }

  connect() {
    this.client.activate();
  }

  private subscribe() {
    this.client.subscribe(
      `/topic/workflows/${encodeURIComponent(this.workflowId)}`,
      (message: IMessage) => {
        try {
          this.onEvent(JSON.parse(message.body) as WorkflowEvent);
        } catch (error) {
          console.error("Invalid workflow WebSocket event:", error);
        }
      },
    );
  }

  disconnect() {
    void this.client.deactivate();
  }
}