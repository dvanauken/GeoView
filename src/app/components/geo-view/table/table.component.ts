import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { FeatureCollection, Feature } from 'geojson';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() model: FeatureCollection | null = null;
  @Output() featureSelect = new EventEmitter<Feature>();
  @Output() filterChange = new EventEmitter<{ filterString: string }>();

  displayedColumns: string[] = [];
  dataSource: any[] = [];
  selectedFeature: Feature | null = null;
  currentWidth: string = '50.00%';

  private resizeObserver: ResizeObserver;

  constructor(public elementRef: ElementRef) {
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.updateWidth(entry.contentRect.width);
      }
    });
  }

  ngOnInit(): void {
    this.updateTable();
  }

  ngAfterViewInit(): void {
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      this.updateTable();
    }
  }

  updateTable(): void {
    if (this.model && this.model.features.length > 0) {
      const firstFeature = this.model.features[0];
      this.displayedColumns = Object.keys(firstFeature.properties || {});
      this.dataSource = this.model.features.map(
        (feature) => feature.properties || {},
      );
    } else {
      this.displayedColumns = [];
      this.dataSource = [];
    }
  }

  onRowClick(row: any): void {
    const feature = this.model?.features.find((f) => f.properties === row);
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
    this.dataSource = [...this.dataSource]; // Reassign to trigger change detection
  }

  applyFilter(filterValue: string): void {
    this.filterChange.emit({ filterString: filterValue });
  }

  private highlightRow(feature: Feature): void {
    // Implement row highlighting logic
    // This requires updating the template to use [class.selected]="row === selectedFeature?.properties"
  }

  private updateWidth(width: number): void {
    this.currentWidth = `${(width / window.innerWidth * 100).toFixed(2)}%`;
  }
}
