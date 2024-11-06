export class GlobeKeyboardHandler {
  constructor(
    private projection: d3.GeoProjection,
    private updateCallback: () => void,
    private zoomCallback: (zoomFactor: number) => void, // New callback for zoom
    private incrementStep: number = 5 // Degree increment for rotation adjustments
  ) {
    this.handleKeydown = this.handleKeydown.bind(this);
    window.addEventListener('keydown', this.handleKeydown, { passive: false });
  }

  private handleKeydown(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent default browser behavior for keys

    const currentRotation = this.projection.rotate();
    let [yaw, pitch, roll] = currentRotation;

    switch (event.key.toUpperCase()) { // Ensure case-insensitivity
      case 'W':
        pitch = Math.min(pitch + this.incrementStep, 90);
        break;
      case 'S':
        pitch = Math.max(pitch - this.incrementStep, -90);
        break;
      case 'A':
        yaw = (yaw - this.incrementStep + 360) % 360;
        break;
      case 'D':
        yaw = (yaw + this.incrementStep) % 360;
        break;
      case 'Q':
        roll = (roll - this.incrementStep + 360) % 360;
        break;
      case 'E':
        roll = (roll + this.incrementStep) % 360;
        break;
      case 'R': // Reset rotation to default (0, 0, 0)
        yaw = 0;
        pitch = 0;
        roll = 0;
        break;
      case '+': // Zoom in
        this.zoomCallback(1.1); // Increase zoom factor
        return;
      case '-': // Zoom out
        this.zoomCallback(0.9); // Decrease zoom factor
        return;
      default:
        return; // Ignore other keys
    }

    this.projection.rotate([yaw, pitch, roll]);
    this.updateCallback();
  }

  public removeEventListener(): void {
    window.removeEventListener('keydown', this.handleKeydown);
  }
}
