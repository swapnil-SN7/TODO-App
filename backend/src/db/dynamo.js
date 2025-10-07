import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { getConfig } from "../utils/config.js";

const { awsRegion, awsAccessKeyId, awsSecretAccessKey, tableName } =
  getConfig();

const baseClient = new DynamoDBClient({
  region: awsRegion,
  credentials:
    awsAccessKeyId && awsSecretAccessKey
      ? {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        }
      : undefined,
});

const docClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: { removeUndefinedValues: true },
});

export async function createTodo(todo) {
  const command = new PutCommand({
    TableName: tableName,
    Item: todo,
    ConditionExpression: "attribute_not_exists(id)",
  });
  await docClient.send(command);
  return todo;
}

export async function listTodos() {
  const command = new ScanCommand({ TableName: tableName });
  const result = await docClient.send(command);
  return result.Items || [];
}

export async function getTodoById(id) {
  const command = new GetCommand({ TableName: tableName, Key: { id } });
  const result = await docClient.send(command);
  return result.Item || null;
}

export async function updateTodoById(id, updates) {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  if (updates.title !== undefined) {
    expressionAttributeNames["#title"] = "title";
    expressionAttributeValues[":title"] = updates.title;
    updateExpressions.push("#title = :title");
  }
  if (updates.description !== undefined) {
    expressionAttributeNames["#description"] = "description";
    expressionAttributeValues[":description"] = updates.description;
    updateExpressions.push("#description = :description");
  }
  if (updates.status !== undefined) {
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
    updateExpressions.push("#status = :status");
  }

  if (updateExpressions.length === 0) {
    return await getTodoById(id);
  }

  const command = new UpdateCommand({
    TableName: tableName,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  });

  const result = await docClient.send(command);
  return result.Attributes || null;
}

export async function deleteTodoById(id) {
  const command = new DeleteCommand({ TableName: tableName, Key: { id } });
  await docClient.send(command);
}


