import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = 'http://localhost:3000/api/flights';

  constructor(private http: HttpClient) { }

  getFlights(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getMilitaryFlights(): Observable<any> {
    return this.http.get('http://localhost:3000/api/military-flights');
  }
}
