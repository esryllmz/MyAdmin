export type RealtimeEventType =
  | "USER_INVITED"
  | "USER_DELETED"
  | "USER_STATUS_CHANGED"
  | "ROLE_SYNCED"
  | "ROLE_CREATED"
  | "SETTINGS_UPDATED"
  | "SYSTEM_HEALTH_UPDATED";

export interface RealtimeEventInput {
  type: RealtimeEventType;
  title: string;
  description: string;
  actor: string;
  status: "success" | "failure";
  entityName?: string;
  entityId?: string | null;
}

export interface RealtimeEvent extends RealtimeEventInput {
  id: string;
  timestamp: string;
  responseTimeMs: number;
  indexed: boolean;
  correlationId: string;
}

type RealtimeListener = (event: RealtimeEvent) => void;

const randomResponseTimeMs = () => Math.round(2 + Math.random() * 10);

/**
 * Backend SignalR hub'ı bağlanana kadar frontend içi event-driven simülasyon
 * katmanı. Sözleşme (subscribe/publish) SignalR bağlandığında değişmeyecek —
 * yalnızca `publish` çağrılarının kaynağı bir hub adapter'ına taşınacak.
 */
class RealtimeEventBus {
  private listeners = new Set<RealtimeListener>();

  subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  publish(input: RealtimeEventInput): RealtimeEvent {
    const event: RealtimeEvent = {
      ...input,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      responseTimeMs: randomResponseTimeMs(),
      indexed: true,
      correlationId: `corr-${crypto.randomUUID().slice(0, 8)}`,
    };

    this.listeners.forEach((listener) => listener(event));
    return event;
  }
}

export const realtimeEventBus = new RealtimeEventBus();
