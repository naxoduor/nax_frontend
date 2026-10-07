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
    const configuredUrl = import.meta.env.VITE_WORKFLOW_WS_URL ?? "ws://localhost:8080/ws";
    const brokerURL = configuredUrl.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");

    this.client = new Client({
      brokerURL,
      reconnectDelay: 5000,
      debug: (message) => console.debug(`[workflow-stomp] ${message}`),
      onChangeState: (state) => {
        console.log(`Workflow WebSocket state: ${state}`);
      },
      onConnect: () => {
        console.log("Connected to workflow WebSocket");
        this.subscribe();
      },
      onUnhandledMessage: (message) => {
        console.warn("Unhandled workflow STOMP message:", message.body);
        this.handleMessage(message);
      },
      onUnhandledFrame: (frame) => {
        console.warn("Unhandled workflow STOMP frame:", frame.command, frame.body);
      },
      onDisconnect: () => {
        console.log("Disconnected from workflow WebSocket");
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onWebSocketError: (event) => {
        console.error("Workflow WebSocket connection error:", event);
      },
      onWebSocketClose: (event) => {
        console.warn(
          `Workflow WebSocket closed (${event.code}): ${event.reason || "no reason"}`,
        );
      },
    });

    console.log(`Workflow WebSocket configured for ${brokerURL}`);
  }

  connect() {
    console.log(`Activating workflow WebSocket for workflowId: ${this.workflowId}`);
    this.client.activate();
  }

  private subscribe() {
    const configuredTopic = import.meta.env.VITE_WORKFLOW_TOPIC;
    const destination = configuredTopic
      ? configuredTopic.replace("{workflowId}", encodeURIComponent(this.workflowId))
      : `/topic/workflows/${encodeURIComponent(this.workflowId)}`;
    const destinations = Array.from(new Set([
      destination,
      "/topic/workflows",
    ]));

    console.log(`Subscribing to workflow events for workflowId: ${this.workflowId}`);
    destinations.forEach((topic, index) => {
      this.client.subscribe(
        topic,
        (message: IMessage) => {
          this.handleMessage(message);
        },
        { id: `workflow-${this.workflowId}-${index}` },
      );
      console.log(`Workflow subscription registered for ${topic}`);
    });
  }

  private handleMessage(message: IMessage) {
    console.log("message is", message.body);
    try {
      this.onEvent(JSON.parse(message.body) as WorkflowEvent);
    } catch (error) {
      console.error("Invalid workflow WebSocket event:", error);
    }
  }

  disconnect() {
    void this.client.deactivate();
  }
}