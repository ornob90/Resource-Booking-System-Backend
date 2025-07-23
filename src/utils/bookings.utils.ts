import moment from "moment-timezone";
import { Booking } from "@prisma/client";
import { AnalyticsSummary } from "../types/booking.types";

export function getNextMeetingTimeRange(
  from: Date,
  timezone: string = "UTC"
): string {
  const now = moment.tz(timezone);
  const target = moment.tz(from, timezone);

  const minutes = target.diff(now, "minutes");

  if (minutes < 60) {
    return `In ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  const hours = target.diff(now, "hours");
  if (hours < 24) {
    return `In ${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  const days = target.diff(now, "days");
  if (days < 7) {
    return `In ${days} day${days !== 1 ? "s" : ""}`;
  }

  const weeks = target.diff(now, "weeks");
  if (weeks < 4) {
    return `In ${weeks} week${weeks !== 1 ? "s" : ""}`;
  }

  const months = target.diff(now, "months");
  if (months < 12) {
    return `In ${months} month${months !== 1 ? "s" : ""}`;
  }

  const years = target.diff(now, "years");
  return `In ${years} year${years !== 1 ? "s" : ""}`;
}

export function getBookingsAnalytics(
  bookings: Booking[],
  timezone: string = "UTC"
): AnalyticsSummary {
  const now = moment.tz(timezone);
  let nextMeetingIn: string | null = null;

  const sortedBookings = bookings
    .filter((b) => moment.tz(b.startTime, timezone).isAfter(now))
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  if (sortedBookings.length) {
    nextMeetingIn = getNextMeetingTimeRange(
      new Date(sortedBookings[0].startTime),
      timezone
    );
  }

  const today = moment.tz(timezone).startOf("day");
  const thisWeek = moment.tz(timezone).startOf("week");
  const thisMonth = moment.tz(timezone).startOf("month");

  let totalToday = 0;
  let totalThisWeek = 0;
  let totalThisMonth = 0;
  const resourceCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};

  bookings.forEach((b) => {
    const start = moment.tz(b.startTime, timezone);

    if (start.isSame(today, "day")) totalToday++;
    if (start.isSame(thisWeek, "week")) totalThisWeek++;
    if (start.isSame(thisMonth, "month")) totalThisMonth++;

    if (b.resource) {
      resourceCounts[b.resource] = (resourceCounts[b.resource] || 0) + 1;
    }

    const hour = start.hour();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mostBookedResource =
    Object.entries(resourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const peakHour = Object.entries(hourCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];
  const peakHourRange =
    peakHour !== undefined ? `${peakHour}:00 - ${+peakHour + 1}:00` : null;

  return {
    nextMeetingIn,
    totalToday,
    totalThisWeek,
    totalThisMonth,
    mostBookedResource,
    peakHourRange,
  };
}
