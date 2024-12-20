// components/two-point-equidistant-map.component.ts
import { Component } from '@angular/core';
import { EquidistantProjection } from './models/equidistant-projection';
import { Point } from './models/point.interface';
import { AbstractTwoPointMapComponent } from './abstract-two-point-map.component';

@Component({
    selector: 'app-two-point-equidistant-map',
    template: `
        <div class="map-container">
            <canvas #mapCanvas></canvas>
            <div class="coordinates-panel">
                <div class="point-inputs">
                    <h4>Point 1 (Purple)</h4>
                    <div>
                        <label>Latitude:</label>
                        <input type="number" 
                               [value]="(state$ | async)?.point1.latitude"
                               (change)="updatePoint1Lat($event)"
                               step="0.001"
                               min="-90"
                               max="90">
                    </div>
                    <div>
                        <label>Longitude:</label>
                        <input type="number"
                               [value]="(state$ | async)?.point1.longitude"
                               (change)="updatePoint1Lng($event)"
                               step="0.001"
                               min="-180"
                               max="180">
                    </div>
                </div>
                <div class="point-inputs">
                    <h4>Point 2 (Green)</h4>
                    <div>
                        <label>Latitude:</label>
                        <input type="number"
                               [value]="(state$ | async)?.point2.latitude"
                               (change)="updatePoint2Lat($event)"
                               step="0.001"
                               min="-90"
                               max="90">
                    </div>
                    <div>
                        <label>Longitude:</label>
                        <input type="number"
                               [value]="(state$ | async)?.point2.longitude"
                               (change)="updatePoint2Lng($event)"
                               step="0.001"
                               min="-180"
                               max="180">
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .map-container {
            position: relative;
            width: 100%;
            height: 100%;
        }
        canvas {
            width: 100%;
            height: 100%;
        }
        .coordinates-panel {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .point-inputs {
            margin-bottom: 15px;
        }
        .point-inputs div {
            margin: 5px 0;
        }
        input {
            width: 100px;
            margin-left: 10px;
        }
    `]
})
export class TwoPointEquidistantMapComponent extends AbstractTwoPointMapComponent {
    protected override initializeProjection(): void {
        const state = this.state$.value;
        this.projection = new EquidistantProjection(state.point1, state.point2);
    }

    updatePoint1Lat(event: Event): void {
        const value = +(event.target as HTMLInputElement).value;
        const currentState = this.state$.value;
        this.updatePoint1({
            ...currentState.point1,
            latitude: value
        });
    }

    updatePoint1Lng(event: Event): void {
        const value = +(event.target as HTMLInputElement).value;
        const currentState = this.state$.value;
        this.updatePoint1({
            ...currentState.point1,
            longitude: value
        });
    }

    updatePoint2Lat(event: Event): void {
        const value = +(event.target as HTMLInputElement).value;
        const currentState = this.state$.value;
        this.updatePoint2({
            ...currentState.point2,
            latitude: value
        });
    }

    updatePoint2Lng(event: Event): void {
        const value = +(event.target as HTMLInputElement).value;
        const currentState = this.state$.value;
        this.updatePoint2({
            ...currentState.point2,
            longitude: value
        });
    }
}