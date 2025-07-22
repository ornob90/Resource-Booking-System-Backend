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

async function main() {
  await prisma.booking.createMany({
    data: [
      {
        resource: "Room A",
        startTime: new Date("2025-07-23T10:00:00"),
        endTime: new Date("2025-07-23T11:00:00"),
        requestedBy: "Alice",
      },
      {
        resource: "Room A",
        startTime: new Date("2025-07-23T13:00:00"),
        endTime: new Date("2025-07-23T14:00:00"),
        requestedBy: "Bob",
      },
      {
        resource: "Camera 1",
        startTime: new Date("2025-07-24T09:00:00"),
        endTime: new Date("2025-07-24T10:30:00"),
        requestedBy: "Charlie",
      },
      {
        resource: "Projector",
        startTime: new Date("2025-07-25T14:00:00"),
        endTime: new Date("2025-07-25T15:00:00"),
        requestedBy: "Daisy",
      },
      {
        resource: "Room B",
        startTime: new Date("2025-07-26T11:00:00"),
        endTime: new Date("2025-07-26T12:30:00"),
        requestedBy: "Ethan",
      },
      {
        resource: "Room A",
        startTime: new Date("2025-07-27T15:00:00"),
        endTime: new Date("2025-07-27T16:00:00"),
        requestedBy: "Fiona",
      },
      {
        resource: "Camera 1",
        startTime: new Date("2025-07-28T09:30:00"),
        endTime: new Date("2025-07-28T10:45:00"),
        requestedBy: "George",
      },
      {
        resource: "Projector",
        startTime: new Date("2025-07-29T10:00:00"),
        endTime: new Date("2025-07-29T11:30:00"),
        requestedBy: "Hannah",
      },
      {
        resource: "Room B",
        startTime: new Date("2025-07-30T13:15:00"),
        endTime: new Date("2025-07-30T14:15:00"),
        requestedBy: "Ivan",
      },
      {
        resource: "Camera 1",
        startTime: new Date("2025-07-31T12:00:00"),
        endTime: new Date("2025-07-31T13:30:00"),
        requestedBy: "Jade",
      },
    ],
  });

  console.log("✅ Seeded 10 bookings.");
}

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

startServer();
