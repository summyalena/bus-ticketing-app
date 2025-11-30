import { HttpCallService } from './../../services/http-call.service';
import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  BusSchedule, 
  Seat, 
  IBusBookingPassenger, 
  IBooking
} from '../model/search.type';

@Component({
  selector: 'app-book-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-ticket.component.html',
  styleUrl: './book-ticket.component.scss'
})
export class BookTicketComponent {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  httpCallService = inject(HttpCallService);
  
  scheduleId!: number;
  busSchedule = signal<BusSchedule | null>(null);
  seats = signal<Seat[]>([]);
  bookedSeats = signal<number[]>([]);
  
  // ✅ Using your existing IBusBookingPassenger interface
  passengers = signal<IBusBookingPassenger[]>([]);
  BookingTicket = signal<IBooking | null>({
    bookingId: 0,
    custId: 0,
    bookingDate: '',
    scheduleId: 0,
    busBookingPassengers: []
  });

  BookingData: IBooking = {
    bookingId: 0,
    custId: 0,
    bookingDate: '',
    scheduleId: 0,
    busBookingPassengers: []
  }
  
  // Computed values
  selectedSeats = computed(() => 
    this.seats().filter(seat => seat.isSelected)
  );
  
  totalAmount = computed(() => {
    const schedule = this.busSchedule();
    if (!schedule) return 0;
    return this.selectedSeats().length * schedule.price;
  });
  
  // ✅ Check if all passengers are filled
  allPassengersFilled = computed(() => {
    return this.passengers().every(p => 
      p.passengerName && p.age && p.gender && p.seatNo
    );
  });
  
  // UI State
  activeTab = signal<'seats' | 'info'>('seats');

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      this.scheduleId = +params['scheduleId'];
      this.getScheduleDetails();
      this.BookingData.scheduleId = this.scheduleId;
      this.BookingData.bookingDate = new Date().toISOString();
      this.BookingData.custId = 12179;
    });
  }

  postBusBooking(){
    this.httpCallService.postBooking(this.BookingData).subscribe((res)=> {
      console.log(res);
    })
  }

  getScheduleDetails() {
    this.httpCallService.getBusDetails(this.scheduleId).subscribe((res: BusSchedule) => {
      this.busSchedule.set(res);
      this.generateSeats(res.totalSeats);
    });
  }

  generateSeats(totalSeats: number) {
    const seatArray: Seat[] = [];
    for (let i = 1; i <= totalSeats; i++) {
      seatArray.push({
        seatNumber: i,
        isBooked: false,
        isSelected: false
      });
    }
    this.seats.set(seatArray);
    this.updateSeatsWithBookedStatus();
  }

  updateSeatsWithBookedStatus() {
    const bookedNumbers = this.bookedSeats();
    this.seats.update(seats => 
      seats.map(seat => ({
        ...seat,
        isBooked: bookedNumbers.includes(seat.seatNumber)
      }))
    );
  }

  toggleSeat(seatNumber: number) {
    // ✅ Update seats selection
    this.seats.update(seats =>
      seats.map(seat =>
        seat.seatNumber === seatNumber && !seat.isBooked
          ? { ...seat, isSelected: !seat.isSelected }
          : seat
      )
    );

    const selectedSeatNumbers = this.selectedSeats().map(s => s.seatNumber);
    const currentPassengers = this.passengers();
    
    // Remove passenger if seat is deselected
    const updatedPassengers = currentPassengers.filter(p => 
      selectedSeatNumbers.includes(p.seatNo)
    );
    
    // Add new passenger if seat is selected
    const newSeatNumbers = selectedSeatNumbers.filter(sn => 
      !currentPassengers.some(p => p.seatNo === sn)
    );
    
    newSeatNumbers.forEach(seatNum => {
      updatedPassengers.push({
        passengerId: 0,
        bookingId: 0,  
        passengerName: '',
        age: 0,
        gender: '',
        seatNo: seatNum
      });
    });
    
    this.passengers.set(updatedPassengers);
  }

  // ✅ Update passenger details
  updatePassenger(index: number, field: keyof IBusBookingPassenger, value: any) {
    this.passengers.update(passengers => {
      const updated = [...passengers];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateDuration(departure: string, arrival: string): string {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  switchTab(tab: 'seats' | 'info') {
    this.activeTab.set(tab);
  }

  proceedToPayment() {
    if (this.selectedSeats().length === 0) {
      alert('Please select at least one seat');
      return;
    }

    // ✅ Validate all passengers are filled
    if (!this.allPassengersFilled()) {
      alert('Please fill in all passenger details');
      return;
    }

    const bookingData = {
      scheduleId: this.scheduleId,
      busBookingPassengers: this.passengers(),
      totalAmount: this.totalAmount(),
      bookingDate: new Date().toISOString()
    };

    console.log('Booking Data:', bookingData);
    // this.router.navigate(['/payment'], { state: { bookingData } });
  }
}