export function getConfig() {
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  const awsRegion = process.env.AWS_REGION || "us-east-1";
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || undefined;
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || undefined;
  const tableName = process.env.DYNAMO_TABLE_NAME || "Todos";

  return {
    port,
    awsRegion,
    awsAccessKeyId,
    awsSecretAccessKey,
    tableName,
  };
}


