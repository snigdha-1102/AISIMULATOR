import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import * as dotenv from "dotenv";

dotenv.config();

export const PROVIDER_MODE = process.env.PROVIDER_MODE || "local";
export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-local-development";
export const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
export const AWS_REGION = process.env.AWS_REGION || "us-east-1";

// AWS Clients
let dynamoDbClient: DynamoDBClient | null = null;
let dynamoDbDocClient: DynamoDBDocumentClient | null = null;
let s3Client: S3Client | null = null;
let cognitoClient: CognitoIdentityProviderClient | null = null;

if (PROVIDER_MODE === "aws") {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    sessionToken: process.env.AWS_SESSION_TOKEN // optional
  };

  const clientConfig = {
    region: AWS_REGION,
    ...(credentials.accessKeyId ? { credentials } : {})
  };

  dynamoDbClient = new DynamoDBClient(clientConfig);
  dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true
    }
  });
  s3Client = new S3Client(clientConfig);
  cognitoClient = new CognitoIdentityProviderClient(clientConfig);
}

export {
  dynamoDbDocClient,
  s3Client,
  cognitoClient
};

export const isAWSMode = () => PROVIDER_MODE === "aws";
export const getCognitoConfig = () => ({
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID || "",
  clientId: process.env.AWS_COGNITO_CLIENT_ID || ""
});
export const getS3BucketName = () => process.env.AWS_S3_BUCKET_NAME || "future-self-simulator-reports";
export const getDynamoTableName = () => process.env.AWS_DYNAMODB_TABLE_NAME || "FutureSelfSimulatorTable";
