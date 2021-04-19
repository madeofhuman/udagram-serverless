import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();
const connectionsTable = process.env.CONNECTIONS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket connect ', event);

  const { connectionId } = event.requestContext;
  const timestamp = new Date().toISOString();

  const newItem = {
    id: connectionId,
    timestamp
  };

  await docClient.put({
    TableName: connectionsTable,
    Item: newItem,
  }).promise();

  return {
    statusCode: 200,
    body: ''
  };
};
