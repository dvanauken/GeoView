// const { TestBed } = require('@angular/core/testing');
// const { HttpClientTestingModule, HttpTestingController } = require('@angular/common/http/testing');
// const { GeoModelService } = require('./geo-model.service');
// const { AirportService } = require('./airport.service');
// const { AirlineService } = require('./airline.service');
// const { GeoModel } = require('../models/geo-model');
// const { of } = require('rxjs');
//
// describe('GeoModelService', () => {
//   let service;
//   let httpMock;
//   let airportServiceSpy;
//   let airlineServiceSpy;
//
//   beforeEach(() => {
//     const airportSpy = jasmine.createSpyObj('AirportService', ['loadAirports']);
//     const airlineSpy = jasmine.createSpyObj('AirlineService', ['loadAirlines']);
//
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [
//         GeoModelService,
//         { provide: AirportService, useValue: airportSpy },
//         { provide: AirlineService, useValue: airlineSpy }
//       ]
//     });
//
//     service = TestBed.inject(GeoModelService);
//     httpMock = TestBed.inject(HttpTestingController);
//     airportServiceSpy = TestBed.inject(AirportService);
//     airlineServiceSpy = TestBed.inject(AirlineService);
//   });
//
//   afterEach(() => {
//     httpMock.verify();
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
//   it('should load data', (done) => {
//     const mockGeoJSON = {
//       type: 'FeatureCollection',
//       features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} }]
//     };
//     const mockAirports = [{ code: 'ABC', name: 'Test Airport', longitude: 0, latitude: 0 }];
//     const mockAirlines = [{ code: 'XYZ', name: 'Test Airline' }];
//
//     airportServiceSpy.loadAirports.and.returnValue(of(mockAirports));
//     airlineServiceSpy.loadAirlines.and.returnValue(of(mockAirlines));
//
//     service.loadData().subscribe(geoModel => {
//       expect(geoModel).toBeTruthy();
//       expect(geoModel.features.length).toBe(3); // 1 from GeoJSON, 1 from airports, 1 from airlines
//       done();
//     });
//
//     const req = httpMock.expectOne('assets/your-geojson-file.json');
//     expect(req.request.method).toBe('GET');
//     req.flush(mockGeoJSON);
//   });
//
//   // Other test cases remain unchanged, just use require() instead of import
//   // Continue with your existing tests below...
// });
