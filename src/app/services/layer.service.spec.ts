// import { TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { LayerService, LoadConfig } from './layer.service';
// import { Observable, of } from 'rxjs'; // Ensure RxJS 'of' is imported
// import { FlightData } from '../interfaces/flight-data.interface';
// import { LoadResult } from './layer.service'; // Assuming LoadResult is exported from layer.service
// import { HttpClient } from '@angular/common/http';
//
//
// describe('LayerService', () => {
//   let layerService: LayerService;
//     let httpTestingController: HttpTestingController;
//     let httpClient: HttpClient;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [LayerService]
//     });
//     layerService = TestBed.inject(LayerService);
//   });
//
//   it('should load and parse GeoJSON', fakeAsync(() => {
//     const mockGeoJson = {
//       type: 'FeatureCollection',
//       features: []
//     };
//
//     // Correcting the spyOn to return an array of LoadResult
//     spyOn(layerService, 'load').and.returnValue(of([{
//       target: 'testLayer',
//       layer: mockGeoJson
//     }]));
//
//     let result: any;
//     layerService.load([{ src: '/base/src/assets/110m/countries.geojson', target: 'testLayer' }]).subscribe(
//       (data) => {
//         result = data;
//       },
//       (error) => {
//         console.error('Error handler called with:', error);
//       }
//     );
//
//     tick(); // Simulate time passage
//
//     expect(result).toBeDefined();
//     expect(Array.isArray(result)).toBe(true);
//     expect(result.length).toBe(1);
//     expect(result[0].target).toBe('testLayer');
//     expect(result[0].layer).toEqual(mockGeoJson);
//     expect(typeof result[0].layer).toBe('object');
//     expect(result[0].layer.type).toBe('FeatureCollection');
//     expect(result[0].layer.features).toEqual([]);
//   }));
//
//
//   it('should initiate loading data', fakeAsync(() => {
//     const config: LoadConfig[] = [{ src: './assets/pa.csv', target: 'flightData' }];
//     const loadSpy = spyOn(layerService, 'load').and.callThrough();
//
//     let loadOperation: Observable<any>;
//     expect(() => {
//       loadOperation = layerService.load(config);
//     }).not.toThrow();
//
//     tick();
//     expect(loadSpy).toHaveBeenCalled();
//     expect(loadOperation).toBeTruthy();
//   }));
//
// });
