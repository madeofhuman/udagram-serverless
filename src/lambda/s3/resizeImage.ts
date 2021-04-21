import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as Jimp from 'jimp';

const s3 = new AWS.S3();

const imagesBucketName = process.env.IMAGES_S3_BUCKET;
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET;

const processImage = async (record: S3EventRecord) => {
  const key = record.s3.object.key;
  console.log('Processing S3 item with key: ', key);

  const response = await s3
    .getObject({
      Bucket: imagesBucketName,
      Key: key
    })
    .promise();

  const body = response.Body;

  // Read an image with the Jimp library
  const image = await Jimp.read(body);

  // Resize an image maintaining the ratio between the image's width and height
  console.log('Resizing image');
  image.resize(150, Jimp.AUTO);

  // Convert an image to a buffer that we can write to a different bucket
  const convertedBuffer = await image.getBufferAsync(Jimp.AUTO);

  console.log('Writing image back to S3 bucket: ', thumbnailBucketName);
  await s3
    .putObject({
      Bucket: thumbnailBucketName,
      Key: `${key}.jpeg`,
      Body: convertedBuffer
    })
    .promise();
};

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      // "record" is an instance of S3EventRecord
      await processImage(record) // A function that should resize each image
    }
  }
};
