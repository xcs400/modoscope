// Imports the Google Cloud client library
const PubSub = require('@google-cloud/pubsub');

// Your Google Cloud Platform project ID
const projectId = 'tiamascope';

// Instantiates a client
const pubsubClient = PubSub({
  projectId: projectId
});

// The name for the new topic
const topicName = 'trace';



function publishMessage (topicName, data) {
  // Instantiates a client
  const pubsub = PubSub();

  // References an existing topic, e.g. "my-topic"
  const topic = pubsub.topic(topicName);

  // Create a publisher for the topic (which can include additional batching configuration)
  const publisher = topic.publisher();

  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);
  return publisher.publish(dataBuffer)
    .then((results) => {
      const messageId = results[0];

      console.log(`Message ${messageId} published.`);

      return messageId;
    });
}

function listenForMessages (subscriptionName, timeout) {
  // Instantiates a client
  const pubsub = PubSub();

  // References an existing subscription, e.g. "my-subscription"
  const subscription = pubsub.subscription(subscriptionName);

  // Create an event handler to handle messages
  let messageCount = 0;
  const messageHandler = (message) => {
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${message.attributes}`);
    messageCount += 1;

    // "Ack" (acknowledge receipt of) the message
    message.ack();
  };

  // Listen for new messages until timeout is hit
  subscription.on(`message`, messageHandler);
  setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`${messageCount} message(s) received.`);
  }, timeout * 1000);
}


listenForMessages("projects/tiamascope/subscriptions/trace",10);


publishMessage("trace" ,"coucou : ");
publishMessage("trace" ,"coucou1 : ");
publishMessage("trace" ,"coucou2 : ");



