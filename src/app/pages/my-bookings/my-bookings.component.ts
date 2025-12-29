import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpCallService } from '../../services/http-call.service';
import { IBooking } from '../model/search.type';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookingsComponent implements OnInit {
  router = inject(Router);
  httpCallService = inject(HttpCallService);
  
  // Hardcoded customer ID (same as booking page)
  readonly CUSTOMER_ID = 12179;
  
  bookings = signal<IBooking[]>([]);
  isLoading = signal(true);
  selectedFilter = signal<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading.set(true);
    this.httpCallService.getMyBookings(this.CUSTOMER_ID).subscribe({
      next: (response: IBooking[]) => {
        this.bookings.set(response);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading bookings:', error);
        this.isLoading.set(false);
      }
    });
  }

  filterBookings(filter: 'all' | 'upcoming' | 'completed' | 'cancelled') {
    this.selectedFilter.set(filter);
  }

  get filteredBookings() {
    const allBookings = this.bookings();
    const filter = this.selectedFilter();
    
    if (filter === 'all') return allBookings;
    
    const now = new Date();
    
    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      
      if (filter === 'upcoming') {
        return bookingDate > now;
      } else if (filter === 'completed') {
        return bookingDate <= now;
      }
      return true;
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  }

  viewBookingDetails(bookingId: number) {
    // Navigate to booking details page
    this.router.navigate(['/booking-details', bookingId]);
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.httpCallService.cancelBooking(bookingId).subscribe({
        next: () => {
          alert('Booking cancelled successfully');
          this.loadBookings();
        },
        error: (error: any) => {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking');
        }
      });
    }
  }
}