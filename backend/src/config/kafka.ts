import { Kafka, Partitioners } from 'kafkajs';
import { config } from './env';

export const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: [config.kafkaBroker],
  retry: {
    initialRetryTime: 300,
    retries: 3,
  },
});

export const getProducer = () => {
  return kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });
};
