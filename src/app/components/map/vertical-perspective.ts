import { geoProjection, GeoProjection } from "d3-geo";
import { VerticalPerspectiveProjection } from './vertical-perspective.by';

interface VerticalProjection extends GeoProjection {
  tilt(t: number): this;
  azimuth(a: number): this;
  distance(d: number): this;
}

function verticalPerspective(): VerticalProjection {
  const handler = new VerticalPerspectiveProjection();
  const baseProjection = handler.getProjection();
  const projection = baseProjection as unknown as VerticalProjection;

  projection.distance = function(d) {
    handler.setDistance(d);
    return this;
  };

  projection.tilt = function(t) {
    handler.setTilt(t);
    return this;
  };

  projection.azimuth = function(a) {
    handler.setAzimuth(a);
    return this;
  };

  // Let d3's GeoProjection handle center
  projection.center([-74, 41.5]);  

  return projection;
}

export default verticalPerspective;