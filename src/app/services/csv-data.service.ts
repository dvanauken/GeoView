// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import * as Papa from 'papaparse';
// import { FlightData } from '../interfaces/flight-data.interface';  // Update the path as necessary
//
// @Injectable({
//   providedIn: 'root'
// })
// export class CsvDataService {
//
//   constructor(private http: HttpClient) { }
//
//   loadCsvData(): Observable<FlightData[]> {
//     return this.http.get('assets/PanAm19840429.csv', { responseType: 'text' })
//       .pipe(
//         map((data) => {
//           let csvData: FlightData[] = [];
//           Papa.parse(data, {
//             header: true,
//             skipEmptyLines: true,
//             complete: (result) => {
//               csvData = result.data as FlightData[];
//             }
//           });
//           return csvData;
//         })
//       );
//   }
// }
