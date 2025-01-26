import amqp, { Channel, Connection } from 'amqplib';
import log from "../utils/logger";

class RabbitMQ {
  private static connection: Connection;
  private static channel: Channel;

  static async connect(url: string): Promise<void> {
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      log.info('Connected to RabbitMQ');
    } catch (error) {
      log.error('Error connecting to RabbitMQ:', error);
    }
  }

  static async publish(queue: string, message: Record<string, unknown>, append: boolean = false): Promise<void> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      if (append) {
        const messages: Array<Record<string, unknown>> = [];
        await this.channel.consume(queue, (msg) => {
            if (msg) {
                messages.push(JSON.parse(msg.content.toString()));
                this.channel.nack(msg, false, true);
            }
        }, { noAck: false });
        log.info(`Existing messages in queue "${queue}":`, messages);
        messages.push(message);
        log.info('Final messages in queue after append:', messages);
      }
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      log.info(`Message published to queue "${queue}":`, message);
    } catch (error) {
      log.error('Error publishing message:', error);
    }
  }

  static async consume(queue: string, onMessage: (msg: Record<string, unknown>) => void): Promise<void> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      log.info(`Waiting for messages in queue "${queue}"...`);

      this.channel.consume(
        queue,
        (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            log.info('Message received:', content);
            onMessage(content);
            this.channel.ack(msg);
          }
        },
        { noAck: false }
      );
    } catch (error) {
      log.error('Error consuming messages:', error);
    }
  }

  static async close(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
    log.info('RabbitMQ connection closed');
  }
}

export default RabbitMQ;
