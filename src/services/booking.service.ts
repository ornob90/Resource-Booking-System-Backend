import moment from "moment-timezone";
import { BookingInput } from "../types/booking.types";
import prisma from "../lib/prisma";

const BUFFER_MINUTES = 10;
export const MIN_DURATION_MINUTES = 15;
export const MAX_DURATION_MINUTES = 120;
const MAX_AVAILABLE_SLOT_HOURS = 12;

export async function isConflictingBooking(input: BookingInput) {
  const { resource, startTime, endTime } = input;

  const newStart = moment(startTime).toDate();
  const newEnd = moment(endTime).toDate();

  console.log({ newStart, newEnd });

  const bufferStart = moment(newStart)
    .subtract(BUFFER_MINUTES, "minutes")
    .toDate();

  const bufferEnd = moment(newEnd).add(BUFFER_MINUTES, "minutes").toDate();

  console.log({ bufferEnd, bufferStart });

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

export async function createBooking(input: BookingInput, timezone = "UTC") {
  const startUtc = moment.tz(input.startTime, timezone).utc().toDate();
  const endUtc = moment.tz(input.endTime, timezone).utc().toDate();

  const booking = await prisma.booking.create({
    data: {
      ...input,
      startTime: startUtc,
      endTime: endUtc,
    },
  });

  return booking;
}

export async function getGlobalAvailableTimeSlots(
  currentTime: string,
  timezone: string
) {
  const now = moment.tz(currentTime, timezone);
  if (!now.isValid()) throw new Error("Invalid currentTime");

  const bookings = await prisma.booking.findMany({
    where: {
      endTime: {
        gt: now.toDate(),
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const slots: {
    title: string;
    resource: string;
    start: string;
    end: string;
  }[] = [];

  if (bookings.length === 0) {
    const defaultEnd = moment(now).add(2, "hours");
    return [
      {
        title: "Available",
        resource: "Any",
        start: now.toISOString(),
        end: defaultEnd.toISOString(),
      },
    ];
  }

  let lastEnd = now;

  const addChunkedSlots = (
    start: moment.Moment,
    end: moment.Moment,
    resource: string
  ) => {
    const chunkSize = MAX_AVAILABLE_SLOT_HOURS;
    let chunkStart = moment(start);
    while (chunkStart.isBefore(end)) {
      const chunkEnd = moment.min(
        moment(chunkStart).add(chunkSize, "hours"),
        end
      );
      slots.push({
        title: "Available",
        resource,
        start: chunkStart.toISOString(),
        end: chunkEnd.toISOString(),
      });
      chunkStart = moment(chunkEnd);
    }
  };

  for (const booking of bookings) {
    const bookingStart = moment
      .tz(booking.startTime, timezone)
      .subtract(BUFFER_MINUTES, "minutes");
    const bookingEnd = moment
      .tz(booking.endTime, timezone)
      .add(BUFFER_MINUTES, "minutes");

    if (lastEnd.isBefore(bookingStart)) {
      addChunkedSlots(lastEnd, bookingStart, booking.resource);
    }

    lastEnd = moment.max(lastEnd, bookingEnd);
  }

  // Add final open-ended slot
  const finalSlotEnd = moment(lastEnd).add(2, "hours");
  addChunkedSlots(lastEnd, finalSlotEnd, "Any");

  return slots;
}

export async function getAllBookings(
  resource?: string,
  date?: string,
  page = 1,
  limit = 10
) {
  const where: any = {};
  if (resource) where.resource = resource;
  if (date) {
    const dayStart = moment(date).startOf("day").toDate();
    const dayEnd = moment(date).endOf("day").toDate();
    where.startTime = { gte: dayStart, lte: dayEnd };
  }

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { startTime: "asc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    bookings: bookings,
    total,
    page,
    limit,
    totalPages,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export async function deleteBooking(id: string) {
  return prisma.booking.delete({ where: { id } });
}
