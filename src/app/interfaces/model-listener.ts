import { GeoModel } from '../models/geo-model';

export interface ModelListener {
  /**
   * Called when the model data is updated.
   * @param model The updated GeoJSONModel
   */
  onModelChange(model: GeoModel): void;

  /**
   * Called when a specific feature in the model is updated.
   * @param featureId The ID of the updated feature
   * @param properties The updated properties
   */
  onFeatureUpdate(featureId: string, properties: { [key: string]: any }): void;
}
