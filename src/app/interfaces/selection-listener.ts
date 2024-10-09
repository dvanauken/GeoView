import { Feature } from 'geojson';

export interface SelectionListener {
  /**
   * Called when a feature is selected.
   * @param feature The selected feature
   */
  onSelect(feature: Feature): void;

  /**
   * Called when a feature is deselected.
   * @param feature The deselected feature
   */
  onDeselect(feature: Feature): void;

  /**
   * Called when the selection is cleared.
   */
  onClearSelection(): void;
}
