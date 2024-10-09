export interface FilterCriteria {
  [key: string]: any;
}

export interface FilterListener {
  /**
   * Called when a filter is applied.
   * @param criteria The filter criteria
   */
  onFilter(criteria: FilterCriteria): void;

  /**
   * Called when the filter is cleared.
   */
  onClearFilter(): void;
}
