import { Kafka } from "kafkajs";

export const createKafkaClient = (service: string) => {
  const broker = process.env.KAFKA_BROKER || "localhost:9094";
  const isCloud = !!process.env.KAFKA_BROKER;

  return new Kafka({
    clientId: service,
    brokers: [broker],
    ssl: isCloud,
    sasl: isCloud && process.env.KAFKA_USERNAME
      ? {
        mechanism: "scram-sha-256" as const,
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD || "",
      }
      : undefined,
  });
};
