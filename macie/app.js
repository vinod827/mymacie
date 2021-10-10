const { IncomingWebhook } = require('@slack/webhook');
const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);

let response;

exports.lambdaHandler = async (event, context) => {
    try {
        console.log(event.detail.resourcesAffected);
        const finding = event.detail.classificationDetails.result.sensitiveData[0].category;
        const findingDescription = event.detail.description;
        const findingTime = event.detail.updatedAt;
        const findingTimeEpoch = Math.floor(new Date(findingTime) / 1000);
        const account = event.detail.accountId;
        const region = event.detail.region;
        const type = event.detail.type;
        const jobId = event.detail.classificationDetails.jobId;
        const lastSeen = `<!date^${findingTimeEpoch}^{date} at {time} | ${findingTime}>`;
        const severity = event.detail.severity.description;
        const category = event.detail.category;
        const color = (`${severity}` === 'High') ? '#FF0000' : (`${severity}` === 'Medium') ? 'FFA500' : '#2091fa';
        const s3BucketArn = event.detail.resourcesAffected.s3Bucket.arn;
        const s3BucketObject = event.detail.resourcesAffected.s3Object.key;

        await webhook.send({
            channel: 'my-macie',
            pretext: `AWS Macie in the AWS Region ${region} for AWS Account id as ${account}`,
            text: `${finding}`,
            attachments: [
                {
                    color: `${color}`,
                    title: `${findingDescription}`,                    
                    author_name: "Macie",
                    author_link: "http://flickr.com/bobby/",
                    author_icon: 'https://k8s-nest.s3.amazonaws.com/download.png',
                    thumb_url:
                        'https://k8s-nest.s3.amazonaws.com/download.png',
                    fields: [
                        {
                            title: 'AWS Account',
                            value: `${account}`,
                            short: true
                        },
                        {
                            title: 'AWS Region',
                            value: `${region}`,
                            short: true
                        },
                        {
                            title: 'Job Id',
                            value: `${jobId}`,
                            short: true
                        },
                        {
                            title: 'Severity',
                            value: `${severity}`,
                            short: true
                        },
                        {
                            title: 'Type',
                            value: `${type}`,
                            short: true
                        },
                        {
                            title: 'Category',
                            value: `${category}`,
                            short: true
                        },
                        {
                            title: 'Finding Time (in Epoch)',
                            value: `${findingTimeEpoch}`,
                            short: true
                        },
                        {
                            title: 'Last Seen',
                            value: `${lastSeen}`,
                            short: true
                        },
                        {
                            title: 'Affected S3 Bucket ARN',
                            value: `${s3BucketArn}`,
                            short: true
                        },
                        {
                            title: 'Affected S3 Bucket Object',
                            value: `${s3BucketObject}`,
                            short: true
                        }
                    ]

                }
            ]
        });

        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
