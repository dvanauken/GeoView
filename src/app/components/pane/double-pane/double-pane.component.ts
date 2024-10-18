import { Component, ElementRef, ViewChild, AfterViewInit, AfterContentInit, ContentChildren, QueryList, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { throttleTime, takeUntil } from 'rxjs/operators';
import { PaneComponent } from '../pane/pane.component';
import { MapComponent } from '../../map/map.component'; // Correct import

@Component({
  selector: 'app-double-pane',
  templateUrl: './double-pane.component.html',
  styleUrls: ['./double-pane.component.scss']
})
export class DoublePaneComponent implements AfterViewInit, AfterContentInit, OnDestroy {
  @ViewChild('map', { static: false }) mapComponent!: MapComponent; // Use template reference

  @ViewChild('divider', { static: true }) divider!: ElementRef;
  @ViewChild('container', { static: true }) container!: ElementRef;
  @ContentChildren(PaneComponent) panes!: QueryList<PaneComponent>;

  isDragging = false;
  leftPaneWidth = 50;
  dividerPosition = '50%';
  private subscriptions: Subscription = new Subscription();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Checking if MapComponent is detected.');
    console.log('MapComponent:', this.mapComponent);

    this.updatePaneWidths();
  }

  ngAfterContentInit() {
    console.log('DoublePaneComponent - ngAfterContentInit');
    console.log('Number of panes:', this.panes.length);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;

    const moveSubscription = fromEvent<MouseEvent>(document, 'mousemove').pipe(
      takeUntil(fromEvent(document, 'mouseup')),
      throttleTime(16) // Approx. 60fps
    ).subscribe(e => this.resize(e.clientX));

    const upSubscription = fromEvent(document, 'mouseup').subscribe(() => {
      this.isDragging = false;
      moveSubscription.unsubscribe();
      upSubscription.unsubscribe();
    });

    this.subscriptions.add(moveSubscription);
    this.subscriptions.add(upSubscription);
  }

  resize(x: number): void {
    const containerRect = this.container.nativeElement.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const newLeftWidth = ((x - containerRect.left) / containerWidth) * 100;
    this.leftPaneWidth = Math.max(10, Math.min(90, newLeftWidth));
    this.dividerPosition = `${this.leftPaneWidth}%`;
    this.updatePaneWidths();
  }

  private updatePaneWidths(): void {
    console.log('Updating pane widths...');
    const paneArray = this.panes.toArray();
    console.log('Pane array:', paneArray);

    if (paneArray.length === 2) {
      console.log(`Setting left pane width to ${this.leftPaneWidth}%`);
      paneArray[0].setWidth(`${this.leftPaneWidth}%`);

      console.log(`Setting right pane width to ${100 - this.leftPaneWidth}%`);
      paneArray[1].setWidth(`${100 - this.leftPaneWidth}%`);

      this.cdr.detectChanges();
      console.log('Change detection triggered.');

      // Ensure the map component exists and trigger its resize logic
      if (this.mapComponent) {
        console.log('Calling resizeMap on the MapComponent instance.');
        this.mapComponent.resizeMap();
      } else {
        console.warn('MapComponent instance not found.');
      }
    } else {
      console.warn('Expected 2 panes, but found:', paneArray.length);
    }
  }
}
