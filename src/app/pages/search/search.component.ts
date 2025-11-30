import { HttpCallService } from './../../services/http-call.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs';
import { Search } from '../model/search.type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [FormsModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  private HttpCallService = inject(HttpCallService);
   busesLocation = signal<any>([]);
   router = inject(Router)

   searchBus = signal<Search>({
    fromLocation: '',
    toLocation: '',
    travelDate: ''
   })


   getSearch(){
    // if(!this.searchBus().fromLocation || !this.searchBus().toLocation || !this.searchBus().travelDate){
    //    alert('Please fill all details');
    //    return;
    // }
    // this.HttpCallService.getSearchBuses(this.searchBus().fromLocation, this.searchBus().toLocation, this.searchBus().travelDate).pipe(
    //   catchError((err)=> {
    //     console.log(err)
    //     throw Error(err);
    //   })
    // ).subscribe((res)=> {
    //   console.log(res);
      
    // })
  
    this.router.navigate(['/search-result',this.searchBus().fromLocation, this.searchBus().toLocation, this.searchBus().travelDate]);
   }

  ngOnInit(): void{
   this.HttpCallService.getBusLocations().pipe(
    catchError((err)=> {
      console.log(err)
      throw Error(err)
    })
   ).subscribe((bus)=> 
  {
    console.log(bus);
    return this.busesLocation.set(bus);
  })
  }
}
