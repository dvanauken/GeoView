//
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, forkJoin } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { Layer } from '../models/layer-model';
// import * as Papa from 'papaparse';
//
// export interface LoadConfig {
//   src: string | { [filename: string]: (data: any[]) => any[] };
//   target: string;
// }
//
// export interface LoadResult {
//   target: string;
//   layer: Layer;
// }
//
// export interface ErrorResult {
//   file: string;
//   error: any;
// }
//
// @Injectable({
//   providedIn: 'root',
// })
// export class LayerService {
//   private successHandlers: ((result: LoadResult) => void)[] = [];
//   private errorHandlers: ((result: ErrorResult) => void)[] = [];
//   private finallyHandler: (() => void) | null = null;
//
//   constructor(private http: HttpClient) {}
//
//   success(handler: (result: LoadResult) => void) {
//     this.successHandlers.push(handler);
//     return this;
//   }
//
//   error(handler: (result: ErrorResult) => void) {
//     this.errorHandlers.push(handler);
//     return this;
//   }
//
//   finally(handler: () => void) {
//     this.finallyHandler = handler;
//     return this;
//   }
//
//   private async loadFile(source: string | { [filename: string]: (data: any[]) => any[] }): Promise<any> {
//     if (typeof source === 'string') {
//       if (source.endsWith('.csv')) {
//         const response = await this.http.get(source, { responseType: 'text' }).toPromise();
//         return new Promise((resolve) => {
//           Papa.parse(response, {
//             header: true,
//             complete: (results) => resolve(results.data)
//           });
//         });
//       }
//       return this.http.get(source).toPromise();
//     } else {
//       // Handle object-based configuration
//       const filename = Object.keys(source)[0];
//       const transform = source[filename];
//       const response = await this.http.get(filename, { responseType: 'text' }).toPromise();
//       return new Promise((resolve) => {
//         Papa.parse(response, {
//           header: true,
//           complete: (results) => {
//             const transformedData = transform(results.data);
//             resolve(transformedData);
//           }
//         });
//       });
//     }
//   }
//
//   private handleSuccess(target: string, data: any): LoadResult {
//     const result = { target, layer: data as Layer };
//     this.successHandlers.forEach(handler => handler(result));
//     return result;
//   }
//
//   private handleError(file: string, error: any): ErrorResult {
//     const result = { file, error };
//     this.errorHandlers.forEach(handler => handler(result));
//     return result;
//   }
//
// //   public load(configs: LoadConfig[]): Observable<LoadResult[]> {
// //     const loadPromises = configs.map(config => {
// //       return this.loadFile(config.src)
// //         .then(data => this.handleSuccess(config.target, data))
// //         .catch(error => this.handleError(
// //           typeof config.src === 'string' ? config.src : Object.keys(config.src)[0],
// //           error
// //         ));
// //     });
// //
// //     return forkJoin(loadPromises).pipe(
// //       map(results => results.filter((result): result is LoadResult =>
// //         'target' in result && result.target !== undefined
// //       )),
// //       catchError(error => {
// //         this.errorHandlers.forEach(handler => handler({ file: 'unknown', error }));
// //         return of([]);
// //       })
// //     );
// //   }
//
//   public load(configs: LoadConfig[]): Observable<LoadResult[]> {
//     const loadPromises = configs.map(config => {
//       return this.loadFile(config.src)
//         .then(data => this.handleSuccess(config.target, data))
//         .catch(error => this.handleError(
//           typeof config.src === 'string' ? config.src : Object.keys(config.src)[0],
//           error
//         ));
//     });
//
//     return forkJoin(loadPromises).pipe(
//       map(results => results.filter((result) => {
//         if ('target' in result && result.target !== undefined) {
//           return true;
//         }
//         return false;
//       }) as LoadResult[]),
//       catchError(error => {
//         this.errorHandlers.forEach(handler => handler({ file: 'unknown', error }));
//         return of([]);
//       })
//     );
//   }
// }
