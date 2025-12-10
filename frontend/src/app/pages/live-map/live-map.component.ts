import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { FlightService } from '../../services/flight.service';
import { interval, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

type FilterType = 'all' | 'commercial' | 'military';

@Component({
  selector: 'app-live-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-map.component.html',
  styleUrl: './live-map.component.css'
})
export class LiveMapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private updateSubscription!: Subscription;

  currentFilter: FilterType = 'all';

  private countryCodes: { [key: string]: string } = {
    'United States': 'us', 'Mexico': 'mx', 'Canada': 'ca', 'Brazil': 'br',
    'Argentina': 'ar', 'Colombia': 'co', 'Chile': 'cl', 'Peru': 'pe',
    'Spain': 'es', 'France': 'fr', 'Germany': 'de', 'United Kingdom': 'gb',
    'Italy': 'it', 'China': 'cn', 'Japan': 'jp', 'Australia': 'au',
    'Russia': 'ru', 'Ukraine': 'ua'
  };

  constructor(private flightService: FlightService) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.startLiveUpdates();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  setFilter(filter: FilterType) {
    this.currentFilter = filter;
    this.loadFlights(); // Reload immediately
  }

  private initMap(): void {
    this.map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private startLiveUpdates(): void {
    this.loadFlights();
    this.updateSubscription = interval(15000).subscribe(() => {
      this.loadFlights();
    });
  }

  private loadFlights(): void {
    const commercial$ = this.flightService.getFlights().pipe(
      catchError(() => of({ states: [] })),
      map(data => (data.states || []).slice(0, 100).map((f: any) => ({
        lat: f[6],
        lon: f[5],
        heading: f[10] || 0,
        callsign: f[1] || 'N/A',
        country: f[2] || 'Unknown',
        type: 'commercial'
      })))
    );

    const military$ = this.flightService.getMilitaryFlights().pipe(
      catchError(() => of({ ac: [] })),
      map(data => (data.ac || []).map((f: any) => ({
        lat: f.lat,
        lon: f.lon,
        heading: f.track || 0,
        callsign: f.flight || f.r || 'MIL',
        country: 'Military', // ADSB.lol often doesn't give country name directly in same format
        type: 'military'
      })))
    );

    let obs$;
    if (this.currentFilter === 'all') {
      obs$ = forkJoin([commercial$, military$]).pipe(
        map(([comm, mil]) => [...comm, ...mil])
      );
    } else if (this.currentFilter === 'commercial') {
      obs$ = commercial$;
    } else {
      obs$ = military$;
    }

    obs$.subscribe({
      next: (flights: any[]) => {
        this.updateMarkers(flights);
      },
      error: (err) => console.error('Error loading flights', err)
    });
  }

  private updateMarkers(flights: any[]): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    flights.forEach((flight: any) => {
      if (flight.lat && flight.lon) {
        const isMilitary = flight.type === 'military';
        const icon = this.createPlaneIcon(flight.heading, isMilitary);
        const flagUrl = this.getFlagUrl(flight.country);

        const popupContent = `
          <div style="text-align: center;">
            <b style="font-size: 1.1em; color: ${isMilitary ? '#0072FF' : '#333'}">
              ${isMilitary ? '[MILITAR] ' : ''}Vuelo: ${flight.callsign}
            </b><br>
            <div style="display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 5px;">
              <b>PAIS:</b>
              ${flagUrl ? `<img src="${flagUrl}" width="20" alt="${flight.country}">` : ''}
              <span>${flight.country}</span>
            </div>
            <div style="margin-top: 5px; font-size: 0.9em; color: #666;">
              Rumbo: ${flight.heading}°
            </div>
          </div>
        `;

        const marker = L.marker([flight.lat, flight.lon], { icon: icon })
          .addTo(this.map)
          .bindPopup(popupContent);

        this.markers.push(marker);
      }
    });
  }

  private createPlaneIcon(rotation: number, isMilitary: boolean): L.DivIcon {
    const color = isMilitary ? '#0072FF' : '#9DC183'; // Blue for Military, Green for Commercial
    // Use the same commercial plane shape for both
    const shape = 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24px" height="24px" style="transform: rotate(${rotation}deg); filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));">
        <path d="${shape}"/>
      </svg>
    `;

    return L.divIcon({
      html: svg,
      className: 'plane-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  private getFlagUrl(countryName: string): string | null {
    const code = this.countryCodes[countryName];
    if (code) {
      return `https://flagcdn.com/24x18/${code}.png`;
    }
    return null;
  }
}
