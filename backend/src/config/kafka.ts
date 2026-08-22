import { Kafka, Partitioners, logLevel } from 'kafkajs';
import { config } from './env';

export const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: [config.kafkaBroker],
  logLevel: logLevel.NOTHING,
  retry: {
    initialRetryTime: 100,
    retries: 0, // Fail-fast so local fallback pipeline activates instantly without error logs
  },
});

export const getProducer = () => {
  return kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });
};
