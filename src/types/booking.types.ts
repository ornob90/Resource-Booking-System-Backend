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
}

export interface DeleteBookingReqParams {
  id?: string;
}
