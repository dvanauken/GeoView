// components/two-point-azimuthal-map.component.ts
import { Component } from '@angular/core';
import { AbstractTwoPointMapComponent } from './abstract-two-point-map.component';
import { AzimuthalProjection } from './models/azimuthal-projection';

@Component({
    selector: 'app-two-point-azimuthal-map',
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
                <!-- Additional azimuthal-specific info -->
                <div class="bearing-info">
                    <h4>Bearings</h4>
                    <div>Initial: {{calculateInitialBearing()}}°</div>
                    <div>Final: {{calculateFinalBearing()}}°</div>
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
        .bearing-info {
            border-top: 1px solid #ddd;
            padding-top: 10px;
            margin-top: 10px;
        }
    `]
})
export class TwoPointAzimuthalMapComponent extends AbstractTwoPointMapComponent {
    protected override initializeProjection(): void {
        const state = this.state$.value;
        this.projection = new AzimuthalProjection(state.point1, state.point2);
    }

    protected override drawPoints(): void {
        super.drawPoints();
        this.drawBearingIndicators();
    }

    private drawBearingIndicators(): void {
        const state = this.state$.value;
        const point1Pos = this.projection.project(state.point1);
        const point2Pos = this.projection.project(state.point2);

        // Draw bearing lines
        const initialBearing = this.calculateInitialBearing();
        const finalBearing = this.calculateFinalBearing();

        this.drawBearingLine(point1Pos, initialBearing, 'purple');
        this.drawBearingLine(point2Pos, finalBearing, 'green');
    }

    private drawBearingLine(point: [number, number], bearing: number, color: string): void {
        const length = 30;
        const radians = (bearing - 90) * Math.PI / 180; // -90 to align with geographic bearing
        const endX = point[0] + length * Math.cos(radians);
        const endY = point[1] + length * Math.sin(radians);

        this.context.beginPath();
        this.context.moveTo(point[0], point[1]);
        this.context.lineTo(endX, endY);
        this.context.strokeStyle = color;
        this.context.lineWidth = 2;
        this.context.stroke();

        // Draw arrowhead
        const arrowSize = 8;
        const arrowAngle = Math.PI / 6;
        
        this.context.beginPath();
        this.context.moveTo(endX, endY);
        this.context.lineTo(
            endX - arrowSize * Math.cos(radians - arrowAngle),
            endY - arrowSize * Math.sin(radians - arrowAngle)
        );
        this.context.lineTo(
            endX - arrowSize * Math.cos(radians + arrowAngle),
            endY - arrowSize * Math.sin(radians + arrowAngle)
        );
        this.context.closePath();
        this.context.fillStyle = color;
        this.context.fill();
    }

    calculateInitialBearing(): number {
        const state = this.state$.value;
        return Number(this.projection['calculateBearing'](state.point1, state.point2).toFixed(1));
    }

    calculateFinalBearing(): number {
        const state = this.state$.value;
        // Final bearing is initial bearing from point 2 to point 1, plus 180 degrees
        return Number(((this.projection['calculateBearing'](state.point2, state.point1) + 180) % 360).toFixed(1));
    }

    // Input handlers (same as equidistant component)
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