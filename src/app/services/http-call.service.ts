import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBooking } from '../pages/model/search.type';

interface searchParams {
  fromLocation: string;
  toLocation: string;
  travelDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class HttpCallService{
cancelBooking(bookingId: number): Observable<any> {
  return this.http.delete(`https://api.freeprojectapi.com/api/BusBooking/DeleteBusBooking?id=${bookingId}`);
}


 getMyBookings(customerId: number): Observable<IBooking[]> {
    return this.http.get<IBooking[]>(
      `https://api.freeprojectapi.com/api/BusBooking/GetBusBooking?id=${customerId}`
    );
  }
  
 http = inject(HttpClient);

 getBusLocations(){
   return this.http.get('https://api.freeprojectapi.com/api/BusBooking/GetBusLocations');
 }  

 getSearchBuses(fromLocation: string, toLocation: string, travelDate: string): Observable<any>{
  return this.http.get(`https://api.freeprojectapi.com/api/BusBooking/searchBus2?fromLocation=${fromLocation}&toLocation=${toLocation}&travelDate=${travelDate}`)
 }

 getBusDetails(scheduleId: number): Observable<any>{
  return this.http.get(`https://api.freeprojectapi.com/api/BusBooking/GetBusScheduleById?id=${scheduleId}`)
 }

 postBooking(bookingData: any): Observable<any>{
  return this.http.post('https://api.freeprojectapi.com/api/BusBooking/PostBusBooking', bookingData);
 }
}
