export const RABBITMQ_CLIENTS = 'RABBITMQ_CLIENTS';

export const RABBITMQ_CONFIG = {
  HOST_URL_KEY: 'RABBITMQ_HOST_URL',
  DEFAULT_URL: 'amqp://guest:guest@localhost:5672',
  CONNECTION_OPTIONS: {
    heartbeat: 60,
    reconnect: true,
    reconnectDelay: 5000,
  }
} as const;

export const RABBITMQ_SERVICES = {
  // Add your services here
} as const;

export const RABBITMQ_QUEUES = {
  // Add your queues here
} as const;

export const RABBITMQ_ROUTING_KEYS = {
  // Add your routing keys here
} as const;
