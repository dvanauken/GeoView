import { GeoModel } from '../models/geo-model';

export interface ModelListener {
  /**
   * Called when the model data is updated.
   * @param model The updated GeoJSONModel
   */
  onModelChange(model: GeoModel): void;

}
