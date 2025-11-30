import { HttpCallService } from './../../services/http-call.service';
import { Search, ISearchResult } from './../model/search.type';
import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.scss'
})
export class SearchResultComponent {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  httpCallService = inject(HttpCallService);

  Search: Search = {
    fromLocation: '',
    toLocation: '',
    travelDate: ''
  };

  searchResults = signal<ISearchResult[]>([]);
  sortBy = signal<string>('departureTime');
  filterPrice = signal<number>(10000);
  filterSeats = signal<number>(0);

  // Computed filtered and sorted results
  filteredResults = computed(() => {
    let results = this.searchResults();
    
    // Filter by available seats
    if (this.filterSeats() > 0) {
      results = results.filter(bus => bus.availableSeats >= this.filterSeats());
    }
    
    // Filter by price
    results = results.filter(bus => bus.price <= this.filterPrice());
    
    // Sort
    const sortField = this.sortBy();
    results = [...results].sort((a, b) => {
      switch(sortField) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'departureTime':
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case 'availableSeats':
          return b.availableSeats - a.availableSeats;
        default:
          return 0;
      }
    });
    
    return results;
  });

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      this.Search.fromLocation = params['from'];
      this.Search.toLocation = params['to'];
      this.Search.travelDate = params['date'];
      this.getSearchBusesResults();
    });
  }

  getSearchBusesResults() {
    this.httpCallService.getSearchBuses(
      this.Search.fromLocation, 
      this.Search.toLocation, 
      this.Search.travelDate
    ).subscribe((res) => {
      this.searchResults.set(res);
    });
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  calculateDuration(departure: string, arrival: string): string {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  bookBus(scheduleId: number) {
    this.router.navigate(['/book-ticket', scheduleId]);
  }

  updateSort(value: string) {
    this.sortBy.set(value);
  }

  updatePriceFilter(value: number) {
    this.filterPrice.set(value);
  }

  updateSeatsFilter(value: number) {
    this.filterSeats.set(value);
  }
}
