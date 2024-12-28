// Dependencies:
import { AMQPClient } from '@cloudamqp/amqp-client'
import {} from 'dotenv/config'

async function startPublisher() {
    try {
        // Setup a connection to the rabbitmq server
        const cloudAMQPURL = process.env.CLOUDAMQP_URL
        const connection = new AMQPClient(cloudAMQPURL)
        await connection.connect()
        console.log('Connected to the RabbitMQ server')

        // Create a channel
        const channel = await connection.channel()
        console.log("[✅] Connection over channel established")

        // Declare the exchange and queue, and create a binding between them
        await channel.exchangeDeclare('emails', 'direct')
        const queue = await channel.queue('email.notifications')
        await channel.queueBind('email.notifications', 'emails', 'notification')

        // Publish a message to the exchange
        async function sendToQueue(routingKey, email, name, body) {
            const message = { email, name, body }
            const jsonMessage = JSON.stringify(message)

            // AMQP Client function expects: publish(exchange, routingKey, message, options)
            await queue.publish('emails', { routingKey }, jsonMessage)
            console.log(`[✉️] Message sent to the queue: ${message}`)
        }

        // Send some messages to the queue
        sendToQueue("notification", "example@example.com", "John Doe", "Hello, John Doe! This is a notification message.")
        sendToQueue("notification", "example@example.com", "Jane Doe", "Hello, Jane Doe! This is a notification message.")
        sendToQueue("resetpassword", "example@example.com", "Will Smith", "Hello, Will Smith! This is a password reset message.")

        // Close the connection
        setTimeout(() => {
            // Close the connection
            connection.close()
            console.log('Connection closed')
            process.exit(0)
        }, 500)
        
    } catch (error) {
        console.error(error)
        //Retry after 3 second
        setTimeout(() => {
            startPublisher()
        }, 3000)
    }
}

(function(){
    startPublisher()
})()