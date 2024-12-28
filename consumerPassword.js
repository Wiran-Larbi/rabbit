import { AMQPClient } from "@cloudamqp/amqp-client";
import {} from "dotenv/config";

async function startConsumer() {
    // Setup a connection to the rabbitmq server
    const cloudAMQPURL = process.env.CLOUDAMQP_URL;
    const connection = new AMQPClient(cloudAMQPURL);
    await connection.connect();
    console.log("Connected to the RabbitMQ server");

    // Create a channel
    const channel = await connection.channel();
    console.log("[✅] Connection over channel established");

    const queue = await channel.queue("email.notifications");

    let counter = 0;

    // Consume messages from the queue
    const consumer = await queue.subscribe({noAck: false}, async (message) => {
        try {
            console.log(`[📩] Received message: ${message.bodyToString()}`);

            message.ack();
        } catch (error) {
            console.error(error);
        }
    })

    // When the process is terminated, close the connection
    process.on('SIGINT', () => {
        channel.close();
        connection.close();
        console.log('Connection closed');
        process.exit(0);
    })

}

(function(){
    startConsumer().catch(console.error);
})();