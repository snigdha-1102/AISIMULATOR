import { PROVIDER_MODE } from "../config/aws";
import { IRepository } from "./interfaces/Repository";
import { LocalRepository } from "./local/LocalRepository";
import { DynamoRepository } from "./dynamodb/DynamoRepository";

let repository: IRepository;

if (PROVIDER_MODE === "aws") {
  console.log("Database initialized in AWS Mode (DynamoDB)");
  repository = new DynamoRepository();
} else {
  console.log("Database initialized in Local Mode (JSON Files)");
  repository = new LocalRepository();
}

export { repository };
