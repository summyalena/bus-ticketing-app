import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'search'
    },
    {
        path: 'search',
        loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent)
    },
    {
        path: 'search-result/:from/:to/:date',
        loadComponent: () => import('./pages/search-result/search-result.component').then(m => m.SearchResultComponent)
    },
    {
        path: 'book-ticket/:scheduleId',
        loadComponent: () => import('./pages/book-ticket/book-ticket.component').then(m => m.BookTicketComponent)
    },
    {
        path: 'my-bookings',
        loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent)
    }
];
