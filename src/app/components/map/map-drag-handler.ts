import * as d3 from 'd3';
import { GeoProjection, GeoPath } from 'd3';
import { throttle } from 'lodash';

export class DragHandler {
  private v0: [number, number, number]; // Mouse position at drag start
  private r0: [number, number, number]; // Projection rotation at drag start
  private q0: [number, number, number, number]; // Initial rotation quaternion

  constructor(
    private projection: GeoProjection,
    private path: GeoPath,
    private gSphere: d3.Selection<SVGGElement, unknown, null, undefined>,
    private gGraticule: d3.Selection<SVGGElement, unknown, null, undefined>,
    private gCountries: d3.Selection<SVGGElement, unknown, null, undefined>,
    private gRoutes: d3.Selection<SVGGElement, unknown, null, undefined>,
    private gAirports: d3.Selection<SVGGElement, unknown, null, undefined>
  ) {}

  private readonly throttledUpdate = throttle(() => {
    // Update all paths
    this.gSphere.selectAll('path').attr('d', this.path);
    this.gGraticule.selectAll('path').attr('d', this.path);
    this.gCountries.selectAll('path').attr('d', this.path);
    this.gRoutes.selectAll('path').attr('d', this.path);
    this.gAirports.selectAll('circle, text').attr('d', this.path);
  }, 16); // ~60fps (1000ms/60 ≈ 16ms)

  public dragStarted(event: any): void {
    this.v0 = [event.x, event.y, 0];
    this.r0 = this.projection.rotate();
  }

  public dragged(event: any): void {
    if (!this.v0) return;

    const sensitivity = 0.25;
    const xChange = (event.x - this.v0[0]) * sensitivity;
    const yChange = (event.y - this.v0[1]) * sensitivity;

    // Update projection rotation
    this.projection.rotate([
      this.r0[0] + xChange,
      this.r0[1] - yChange,
      this.r0[2]
    ]);

    // Use throttled update instead of direct updates
    this.throttledUpdate();
  }

  public dragEnded(): void {
    this.v0 = undefined;
    this.r0 = undefined;
    this.q0 = undefined;

    // Force a final update to ensure we render the final position
    this.throttledUpdate.flush();
  }

  public destroy(): void {
    // Clean up throttled function
    this.throttledUpdate.cancel();
  }
}
