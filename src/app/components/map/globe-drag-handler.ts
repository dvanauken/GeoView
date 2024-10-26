import { throttle, DebouncedFunc } from 'lodash';
import * as d3 from 'd3';

export class GlobeDragHandler {
  private v0: [number, number, number]; // Mouse position at drag start
  private r0: [number, number, number]; // Projection rotation at drag start
  private readonly throttledUpdate: DebouncedFunc<() => void>;

  constructor(
    private projection: d3.GeoProjection,
    private updateCallback: () => void,
    private throttleTime: number = 16 // ~60fps default
  ) {
    this.throttledUpdate = throttle(() => {
      this.updateCallback();
    }, this.throttleTime);

    // Bind methods to ensure correct 'this' context
    this.dragStarted = this.dragStarted.bind(this);
    this.dragged = this.dragged.bind(this);
    this.dragEnded = this.dragEnded.bind(this);
  }

  public dragStarted(event: d3.D3DragEvent<any, any, any>): void {
    const point = d3.pointer(event, event.sourceEvent.currentTarget);
    this.v0 = [point[0], point[1], 0];
    this.r0 = this.projection.rotate();
  }

  public dragged(event: d3.D3DragEvent<any, any, any>): void {
    if (!this.v0 || !this.r0) return;

    const point = d3.pointer(event, event.sourceEvent.currentTarget);
    const sensitivity = 0.25;
    const xChange = (point[0] - this.v0[0]) * sensitivity;
    const yChange = (point[1] - this.v0[1]) * sensitivity;

    // Update projection rotation
    this.projection.rotate([
      this.r0[0] + xChange,
      this.r0[1] - yChange,
      this.r0[2]
    ]);

    // Use throttled update
    this.throttledUpdate();
  }

  public dragEnded(): void {
    this.v0 = undefined;
    this.r0 = undefined;

    // Force a final update to ensure we render the final position
    if (this.throttledUpdate.flush) {
      this.throttledUpdate.flush();
    }
  }

  public destroy(): void {
    if (this.throttledUpdate.cancel) {
      this.throttledUpdate.cancel();
    }
  }

  public attachDragBehavior(selection: d3.Selection<any, unknown, null, undefined>): void {
    const dragBehavior = d3.drag<any, unknown>()
      .on('start', this.dragStarted)
      .on('drag', this.dragged)
      .on('end', this.dragEnded);

    selection.call(dragBehavior);
  }
}
