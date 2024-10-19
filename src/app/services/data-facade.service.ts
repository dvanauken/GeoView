// import { Injectable } from '@angular/core';
// import { Observable, forkJoin } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { AirportService } from './airport.service';
// import { AirlineService } from './airline.service';
// import { GeoModelService } from './geo-model.service';
// import { GeoModel } from './geo-model';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class DataFacadeService {
//   constructor(
//     private airportService: AirportService,
//     private airlineService: AirlineService,
//     private geoModelService: GeoModelService
//   ) {}
//
//   loadAllData(): Observable<{ geoModel: GeoModel, airports: any[], airlines: any[] }> {
//     return forkJoin({
//       airports: this.airportService.loadAirports(),
//       airlines: this.airlineService.loadAirlines(),
//       geoModel: this.geoModelService.loadData()
//     }).pipe(
//       map(({ airports, airlines, geoModel }) => {
//         // Here you can add any cross-service logic if needed
//         return { geoModel, airports, airlines };
//       })
//     );
//   }
//
//   getGeoModel(): Observable<GeoModel> {
//     return this.geoModelService.getGeoModel();
//   }
//
//   getAirportByCode(code: string): any | undefined {
//     return this.airportService.getAirportByCode(code);
//   }
//
//   getAirlineByCode(code: string): any | undefined {
//     return this.airlineService.getAirlineByCode(code);
//   }
//
//   // Add other methods as needed to coordinate between services
// }
