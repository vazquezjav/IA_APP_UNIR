import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LiveMapComponent } from './live-map.component';
import { FlightService } from '../../services/flight.service';
import { of, throwError } from 'rxjs';
import * as L from 'leaflet';

describe('LiveMapComponent', () => {
    let component: LiveMapComponent;
    let fixture: ComponentFixture<LiveMapComponent>;
    let flightServiceSpy: jasmine.SpyObj<FlightService>;

    // Mock Leaflet
    const mapSpy = jasmine.createSpyObj('Map', ['setView', 'addLayer', 'remove']);
    const tileLayerSpy = jasmine.createSpyObj('TileLayer', ['addTo']);
    const markerSpy = jasmine.createSpyObj('Marker', ['addTo', 'bindPopup', 'remove']);

    beforeEach(async () => {
        const flightSpy = jasmine.createSpyObj('FlightService', ['getFlights', 'getMilitaryFlights']);

        // Mock L.map, L.tileLayer, L.marker, L.divIcon
        spyOn(L, 'map').and.returnValue(mapSpy);
        spyOn(L, 'tileLayer').and.returnValue(tileLayerSpy);
        spyOn(L, 'marker').and.returnValue(markerSpy);
        spyOn(L, 'divIcon').and.returnValue({} as any);

        // Mock chained methods
        tileLayerSpy.addTo.and.returnValue(tileLayerSpy);
        markerSpy.addTo.and.returnValue(markerSpy);
        markerSpy.bindPopup.and.returnValue(markerSpy);

        await TestBed.configureTestingModule({
            imports: [LiveMapComponent],
            providers: [
                { provide: FlightService, useValue: flightSpy }
            ]
        }).compileComponents();

        flightServiceSpy = TestBed.inject(FlightService) as jasmine.SpyObj<FlightService>;
        fixture = TestBed.createComponent(LiveMapComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize map on view init', () => {
        flightServiceSpy.getFlights.and.returnValue(of({ states: [] }));
        flightServiceSpy.getMilitaryFlights.and.returnValue(of({ ac: [] }));

        component.ngAfterViewInit();

        expect(L.map).toHaveBeenCalledWith('map');
        expect(L.tileLayer).toHaveBeenCalled();
    });

    it('should load flights and create markers', () => {
        const mockCommercial = { states: [['callsign1', 'USA', 'USA', 0, 0, 10, 20, 0, 0, 0, 180]] };
        const mockMilitary = { ac: [] };

        flightServiceSpy.getFlights.and.returnValue(of(mockCommercial));
        flightServiceSpy.getMilitaryFlights.and.returnValue(of(mockMilitary));

        component.ngAfterViewInit();

        expect(flightServiceSpy.getFlights).toHaveBeenCalled();
        expect(L.marker).toHaveBeenCalled();
        expect(markerSpy.addTo).toHaveBeenCalled();
    });

    it('should filter commercial flights', () => {
        const mockCommercial = { states: [['callsign1', 'USA', 'USA', 0, 0, 10, 20, 0, 0, 0, 180]] };
        const mockMilitary = { ac: [{ flight: 'MIL1', lat: 30, lon: 40 }] };

        flightServiceSpy.getFlights.and.returnValue(of(mockCommercial));
        flightServiceSpy.getMilitaryFlights.and.returnValue(of(mockMilitary));

        component.setFilter('commercial');

        expect(component.currentFilter).toBe('commercial');
        // Should only process commercial data logic (verified by marker count or calls if we could inspect internal state easily)
        // Here we verify the service call happens
        expect(flightServiceSpy.getFlights).toHaveBeenCalled();
    });

    it('should poll for updates', fakeAsync(() => {
        flightServiceSpy.getFlights.and.returnValue(of({ states: [] }));
        flightServiceSpy.getMilitaryFlights.and.returnValue(of({ ac: [] }));

        component.ngAfterViewInit();

        // Initial call
        expect(flightServiceSpy.getFlights).toHaveBeenCalledTimes(1);

        // Fast forward 15s
        tick(15000);
        expect(flightServiceSpy.getFlights).toHaveBeenCalledTimes(2);

        component.ngOnDestroy(); // Cleanup subscription
    }));

    it('should handle error loading flights', () => {
        flightServiceSpy.getFlights.and.returnValue(throwError(() => new Error('API Error')));
        flightServiceSpy.getMilitaryFlights.and.returnValue(of({ ac: [] }));
        spyOn(console, 'error');

        component.ngAfterViewInit();

        // The component catches error in pipe? 
        // Looking at code: catchError(() => of({ states: [] }))
        // So it should NOT throw, but return empty.
        // Wait, line 106: error: (err) => console.error(...)
        // If catchError handles it, then next() is called with empty.
        // Let's test that markers are empty.
        expect(markerSpy.addTo).not.toHaveBeenCalled();
    });
});
