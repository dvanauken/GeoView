import { Injectable } from '@angular/core';
import {DataModel} from "../models/data-model";

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  constructor() {}

  async loadAirportData(): Promise<any[]> {
    const response = await fetch('assets/Airport.json');
    if (!response.ok) throw new Error('Failed to fetch airport data');
    const data = await response.json();
    DataModel.getInstance().setAirports(data); // Assuming setAirports method is implemented in DataModel
    console.log('Airport data loaded and stored in DataModel');
    return data;
  }
}
