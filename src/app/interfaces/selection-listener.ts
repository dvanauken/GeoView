import { FeatureModel } from '../models/feature.model';

export interface SelectionListener {
  /**
   * Called when a feature is selected.
   * @param feature The selected feature
   */
  onSelect(feature: FeatureModel): void;

  /**
   * Called when a feature is deselected.
   * @param feature The deselected feature
   */
  onDeselect(feature: FeatureModel): void;

  /**
   * Called when the selection is cleared.
   */
  onClearSelection(): void;
}
