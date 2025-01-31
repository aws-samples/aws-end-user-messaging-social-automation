# Automate Workflows with WhatsApp using AWS End User Messaging Social

The solution uses [AWS End User Messaging Social](https://docs.aws.amazon.com/social-messaging/latest/userguide/what-is-service.html) to integrate your workload deployed on AWS with your Meta business portfolio. This allows you to receive WhatsApp messages sent from your end customers directly in your AWS environment. When a WhatsApp message is received, End User Messaging Social triggers an Amazon Simple Notification Service (SNS) notification, which in turn triggers an AWS Lambda function to process the request. This Lambda function processes the request and then sends a WhatsApp message as a response back to the user. The solution can be further expanded to build complex business workflows or automate your marketing campaigns using WhatsApp.

## Prerequisites

* A Meta business portfolio, that you can create by following the [instructions here](https://www.facebook.com/business/help/1710077379203657)
* A phone number to create a WABA
* A smartphone with WhatsApp messenger app installed to test the solution. Note that the app should use a different phone number than the one that is associated with your WABA.
* AWS CLI [installed](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) to access to your AWS account
* Serverless Application Model [CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) to deploy the sample application
* [node.js](https://nodejs.org/en/download/package-manager) >= 22.x
* Follow the steps in the accompanied [blog](https://aws.amazon.com/blogs/messaging-and-targeting/whatsapp-aws-end-user-messaging-social/) to link your WABA account and Meta business portfolio

## Deploy the application

```bash
sam build
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: `EndUserMessagingWhatsApp`
* **AWS Region [us-east-1]**: `[AWS region where you have created the WABA account]`
* **Parameter SNSTopicArn []**: `[ARN of the SNS topic created in Step 1 of the blog]`
* **Parameter PhoneNumberID []**: `[Phone number ID from Step 2 of the blog]`

Accept the defaults of the rest of the prompts to complete the deployment. This will create a Lambda function that is triggered when a WhatsApp message is sent to your WABA number

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
sam delete
```

## Security
Note that in the [Lambda function](whatsapp-message-handler/app.mjs), you will process the raw message sent by the end user. If you extend this example to perform additional tasks, implement proper security controls, like OWASP Top Ten (https://owasp.org/www-project-top-ten/), among others to protect against vulnerabilities.

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

