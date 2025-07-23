export interface BookingInput {
  resource: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
}

export interface GetBookingsReqQuery {
  resource?: string;
  date?: string;
  page?: string;
  limit?: string;
  timezone?: string;
}

export interface DeleteBookingReqParams {
  id?: string;
}

export type AnalyticsSummary = {
  nextMeetingIn: string | null;
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  mostBookedResource: string | null;
  peakHourRange: string | null;
};
