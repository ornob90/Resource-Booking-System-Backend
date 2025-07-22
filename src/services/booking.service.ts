import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { BookingInput } from "../types/booking.types";

const prisma = new PrismaClient();

const BUFFER_MINUTES = 10;
const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 120;

export async function isConflictingBooking(input: BookingInput) {
  const { resource, startTime, endTime } = input;

  const newStart = moment(startTime).toDate();
  const newEnd = moment(endTime).toDate();

  const bufferStart = moment(newStart)
    .subtract(BUFFER_MINUTES, "minutes")
    .toDate();
  const bufferEnd = moment(newEnd).add(BUFFER_MINUTES, "minutes").toDate();

  const conflicts = await prisma.booking.findMany({
    where: {
      resource,
      OR: [
        {
          startTime: { lte: bufferEnd },
          endTime: { lte: bufferStart },
        },
      ],
    },
  });

  return conflicts.length > 0;
}

export async function createBooking(input: BookingInput) {
  const booking = await prisma.booking.create({
    data: {
      ...input,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
    },
  });

  return booking;
}
