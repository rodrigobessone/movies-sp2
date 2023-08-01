import { Client, ClientConfig } from "pg";
import { config as dotenvConfig } from "dotenv";

interface DBConfig extends ClientConfig {}

dotenvConfig();

const dbConfig: DBConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || "5432"),
};

const client = new Client(dbConfig);

const connectDB = async (): Promise<void> => {
  await client.connect();
  console.log("Connected to database!");
};

export { connectDB, client };
