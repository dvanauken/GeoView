import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
} from '@angular/core';
import { GeoModel } from '../../../models/geo-model';
import { CriteriaModel } from '../../../models/criteria.model';
import { ModelListener } from '../../../interfaces/model-listener';
import { SelectionListener } from '../../../interfaces/selection-listener';
import { Feature } from 'geojson';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent
  implements OnInit, ModelListener, SelectionListener
{
  @Input() model: GeoModel | null = null;
  @Output() featureSelect = new EventEmitter<Feature>();
  @Output() filterChange = new EventEmitter<CriteriaModel>();

  displayedColumns: string[] = [];
  dataSource: any[] = [];
  selectedFeature: Feature | null = null;

  constructor(public elementRef: ElementRef) {} // Inject ElementRef

  ngOnInit(): void {
    if (this.model) {
      this.updateTable();
    }
  }

  onModelChange(model: GeoModel): void {
    this.model = model;
    this.updateTable();
  }

  onSelect(feature: Feature): void {
    this.selectedFeature = feature;
    this.highlightRow(feature);
  }

  onDeselect(feature: Feature): void {
    if (this.selectedFeature === feature) {
      this.selectedFeature = null;
    }
  }

  onClearSelection(): void {
    this.selectedFeature = null;
    // Implement logic to clear row highlighting
  }

  updateTable(): void {
    if (this.model && this.model.data.features.length > 0) {
      const firstFeature = this.model.data.features[0];
      this.displayedColumns = Object.keys(firstFeature.properties || {});
      this.dataSource = this.model.data.features.map(
        (feature) => feature.properties || {},
      );
    } else {
      this.displayedColumns = [];
      this.dataSource = [];
    }
  }

  onFeatureUpdate(featureId: string, properties: { [key: string]: any }): void {
    if (this.model) {
      const feature = this.model.features.find((f) => f.id === featureId);
      if (feature) {
        Object.assign(feature.properties, properties);
        this.updateTable();
      }
    }
  }

  onRowClick(row: any): void {
    const feature = this.model?.data.features.find((f) => f.properties === row);
    if (feature) {
      this.featureSelect.emit(feature);
    }
  }

  sortData(column: string): void {
    this.dataSource.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });
    // Trigger change detection
    this.dataSource = [...this.dataSource];
  }

  applyFilter(filterValue: string): void {
    const criteria: CriteriaModel = { filterString: filterValue };
    this.filterChange.emit(criteria);
  }

  private highlightRow(feature: Feature): void {
    // Implement row highlighting logic
    // For example, you could add a CSS class to the selected row
    // This would require updating the template to use [class.selected]="row === selectedFeature?.properties"
  }

  resize(width: number, height: number): void {
    this.elementRef.nativeElement.style.width = `${width}%`;
    this.elementRef.nativeElement.style.height = `${height}px`;
    // Adjust table layout if necessary
  }}
