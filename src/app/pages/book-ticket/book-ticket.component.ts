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
  
  readonly CUSTOMER_ID = 12179;
  
  scheduleId!: number;
  busSchedule = signal<BusSchedule | null>(null);
  seats = signal<Seat[]>([]);
  bookedSeats = signal<number[]>([]);
  passengers = signal<IBusBookingPassenger[]>([]);
  
  isSubmitting = signal(false);
  
  showModal = signal(false);
  modalType = signal<'success' | 'error' | 'warning'>('success');
  modalTitle = signal('');
  modalMessage = signal('');
  modalDetails = signal<string[]>([]);
  
  selectedSeats = computed(() => 
    this.seats().filter(seat => seat.isSelected)
  );
  
  totalAmount = computed(() => {
    const schedule = this.busSchedule();
    if (!schedule) return 0;
    return this.selectedSeats().length * schedule.price;
  });
  
  allPassengersFilled = computed(() => {
    return this.passengers().every(p => 
      p.passengerName && p.age && p.gender && p.seatNo
    );
  });
  
  activeTab = signal<'seats' | 'info'>('seats');

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      this.scheduleId = +params['scheduleId'];
      this.getScheduleDetails();
    });
  }

  getScheduleDetails() {
    this.httpCallService.getBusDetails(this.scheduleId).subscribe({
      next: (res: BusSchedule) => {
        this.busSchedule.set(res);
        this.generateSeats(res.totalSeats);
      },
      error: (error) => {
        console.error('Error loading bus details:', error);
        this.showErrorModal('Failed to Load', 'Could not load bus details. Please try again.');
      }
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
    this.seats.update(seats =>
      seats.map(seat =>
        seat.seatNumber === seatNumber && !seat.isBooked
          ? { ...seat, isSelected: !seat.isSelected }
          : seat
      )
    );

    const selectedSeatNumbers = this.selectedSeats().map(s => s.seatNumber);
    const currentPassengers = this.passengers();
    
    const updatedPassengers = currentPassengers.filter(p => 
      selectedSeatNumbers.includes(p.seatNo)
    );
    
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

  showSuccessModal(title: string, message: string, details: string[] = []) {
    this.modalType.set('success');
    this.modalTitle.set(title);
    this.modalMessage.set(message);
    this.modalDetails.set(details);
    this.showModal.set(true);
  }

  showErrorModal(title: string, message: string, details: string[] = []) {
    this.modalType.set('error');
    this.modalTitle.set(title);
    this.modalMessage.set(message);
    this.modalDetails.set(details);
    this.showModal.set(true);
  }

  showWarningModal(title: string, message: string) {
    this.modalType.set('warning');
    this.modalTitle.set(title);
    this.modalMessage.set(message);
    this.modalDetails.set([]);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onModalConfirm() {
    this.closeModal();
    if (this.modalType() === 'success') {
      this.router.navigate(['/my-bookings']);
    }
  }

  postBusBooking() {
    if (this.selectedSeats().length === 0) {
      this.showWarningModal('No Seats Selected', 'Please select at least one seat before proceeding.');
      return;
    }

    if (!this.allPassengersFilled()) {
      this.showWarningModal('Incomplete Details', 'Please fill in all passenger details before proceeding.');
      return;
    }

    const bookingData: IBooking = {
      bookingId: 0,
      custId: this.CUSTOMER_ID,
      bookingDate: new Date().toISOString(),
      scheduleId: this.scheduleId,
      busBookingPassengers: this.passengers()
    };

    console.log('📤 Posting Booking Data:', bookingData);

    this.isSubmitting.set(true);

    this.httpCallService.postBooking(bookingData).subscribe({
      next: (response: IBooking) => {
        console.log('✅ Booking successful!', response);
        this.isSubmitting.set(false);
        
        const passengerCount = this.passengers().length;
        const seatNumbers = this.passengers().map(p => p.seatNo).join(', ');
        
        this.showSuccessModal(
          'Booking Confirmed!',
          'Your bus ticket has been successfully booked.',
          [
            `Booking ID: #${response.bookingId}`,
            `Seats: ${seatNumbers}`,
            `Passengers: ${passengerCount}`,
            `Total Amount: ₦${this.totalAmount()}`
          ]
        );
      },
      error: (error) => {
        console.error('❌ Booking failed:', error);
        this.isSubmitting.set(false);
        
        let errorMessage = 'Unable to complete your booking. Please try again.';
        
        if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.showErrorModal('Booking Failed', errorMessage);
      }
    });
  }
}