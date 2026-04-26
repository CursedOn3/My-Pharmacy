import { EventEmitter } from "events";

type EventPayload = {
  type: string;
  data: Record<string, unknown>;
};

const emitter = new EventEmitter();

export const publishEvent = (payload: EventPayload) => {
  emitter.emit("event", payload);
};

export const subscribe = (handler: (payload: EventPayload) => void) => {
  emitter.on("event", handler);
  return () => emitter.off("event", handler);
};
