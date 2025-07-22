import http from "http";
import app from "./app";
import dotenv from "dotenv";
import prisma from "./lib/prisma";
dotenv.config();

const PORT = process.env.PORT || 8081;

const server = http.createServer(app);

async function startServer() {
  try {
    await prisma.$connect();

    server.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  } catch (err: any) {
    console.log("Failed to start server", err.message);
    process.exit(1);
  }
}




startServer();
