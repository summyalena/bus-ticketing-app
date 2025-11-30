export type Search = {
    fromLocation: string,
    toLocation: string,
    travelDate: string
}

export interface ISearchResult {
  availableSeats: number
  totalSeats: number
  price: number
  arrivalTime: string
  scheduleId: number
  departureTime: string
  busName: string
  busVehicleNo: string
  fromLocationName: string
  toLocationName: string
  vendorName: string
  scheduleDate: string
  vendorId: number
}

export interface IBusDetails {
  scheduleId: number
  vendorId: number
  busName: string
  busVehicleNo: string
  fromLocation: number
  toLocation: number
  departureTime: string
  arrivalTime: string
  scheduleDate: string
  price: number
  totalSeats: number
}

export type ScheduleId = {
    scheduleId: number
}

export interface BusSchedule {
  scheduleId: number;
  vendorId: number;
  busName: string;
  busVehicleNo: string;
  fromLocation: number;
  toLocation: number;
  departureTime: string;
  arrivalTime: string;
  scheduleDate: string;
  price: number;
  totalSeats: number;
}

export interface Seat {
  seatNumber: number;
  isBooked: boolean;
  isSelected: boolean;
}

export interface IBooking {
  bookingId: number
  custId: number
  bookingDate: string
  scheduleId: number
  busBookingPassengers: IBusBookingPassenger[]
}

export interface IBusBookingPassenger {
  passengerId: number
  bookingId: number
  passengerName: string
  age: number
  gender: string
  seatNo: number
}
