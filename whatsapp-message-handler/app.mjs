import {SendWhatsAppMessageCommand, SocialMessagingClient} from '@aws-sdk/client-socialmessaging';

export const lambdaHandler = async (event) => {
    try {
        console.debug('Received Event from SNS');
        const customerMessage = await getCustomerMessageDetails(event);

        if (!customerMessage) {
            console.info('Not a customer text message');
            return {
                statusCode: 200,
                body: JSON.stringify({message: 'Not a customer text message'}),
            };
        }

        console.info('Message received from customer.');

        await acknowledge(customerMessage);
        await reply(customerMessage);

        return {
            statusCode: 200,
            body: JSON.stringify({message: 'Message processed successfully'}),
        };
    } catch (error) {
        console.error("Error occurred while processing the request.");
        return {
            statusCode: 500,
            body: JSON.stringify({message: 'Error occurred while processing the message'}),
        };
    }
};

const acknowledge = async (customerMessage) => {
    const metaMessage = {
        messaging_product: 'whatsapp',
        message_id: customerMessage.id,
        status: 'read'
    };
    await sendWhatsAppMessage(metaMessage);
};

const reply = async (customerMessage) => {
    // SECURITY ALERT: Note that in this function, you will process the raw message sent by the end user.
    // If you extend this example to perform additional tasks, implement proper security controls, like
    // OWASP Top Ten (https://owasp.org/www-project-top-ten/), among others to protect against vulnerabilities.

    const defaultMessage = 'To implement more features, please visit https://aws.amazon.com/end-user-messaging/';
    const isGreeting = customerMessage?.message?.toLowerCase().match(/^(hello|hi|hey|hiya)/i);

    if (isGreeting) {
        await react(customerMessage);
        await sendOptions(customerMessage);
    } else {
        const metaMessage = {
            messaging_product: 'whatsapp',
            to: `+${customerMessage.from}`,
            text: {
                preview_url: false,
                body: defaultMessage
            }
        };
        await sendWhatsAppMessage(metaMessage);
    }
};

const react = async (customerMessage) => {
    const waveEmoji = '\uD83D\uDC4B';

    const metaMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: `+${customerMessage.from}`,
        type: 'reaction',
        reaction: {
            message_id: customerMessage.id,
            emoji: waveEmoji
        }
    };
    await sendWhatsAppMessage(metaMessage);
};

const sendOptions = async (customerMessage) => {
    const metaTextMessage = {
        messaging_product: 'whatsapp',
        to: `+${customerMessage.from}`,
        text: {
            preview_url: false,
            body: `Hello ${customerMessage.name ?? 'there'}! How can we help you?`
        }
    };
    await sendWhatsAppMessage(metaTextMessage);

    const metaInteractiveMessage = {
        messaging_product: 'whatsapp',
        to: `+${customerMessage.from}`,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: 'Please choose:'
            },
            action: {
                buttons: [
                    {
                        type: 'reply',
                        reply: {
                            id: 'OPTION_PLACE_ORDER',
                            title: 'Place a new order'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'OPTION_CHECK_STATUS',
                            title: 'Check order status'
                        }
                    }
                ]
            }
        }
    };

    await sendWhatsAppMessage(metaInteractiveMessage);
};

const sendWhatsAppMessage = async (metaMessage) => {
    const metaAPIVersion = 'v20.0';

    const client = new SocialMessagingClient();
    const sendWhatsAppMessageRequest = {
        originationPhoneNumberId: process.env.PHONE_NUMBER_ID,
        message: JSON.stringify(metaMessage),
        metaApiVersion: metaAPIVersion,
    };

    console.debug("Send message request.");
    const command = new SendWhatsAppMessageCommand(sendWhatsAppMessageRequest);
    await client.send(command);
    console.debug("Send message complete.");
};

const getCustomerMessageDetails = async (event) => {
    const eumMessage = JSON.parse(event.Records[0].Sns.Message);
    const webhookData = eumMessage.whatsAppWebhookEntry;
    const webhookDataParsed = typeof webhookData === 'string' ? JSON.parse(webhookData) : webhookData;

    const messageDetails = {
        name: webhookDataParsed?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ?? null,
        from: webhookDataParsed?.changes?.[0]?.value?.messages?.[0]?.from ?? null,
        id: webhookDataParsed?.changes?.[0]?.value?.messages?.[0]?.id ?? null,
        message: webhookDataParsed?.changes?.[0]?.value?.messages?.[0]?.text?.body ?? null
    };

    return messageDetails.from ? messageDetails : null;
};