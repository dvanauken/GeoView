import { Component, Input, ElementRef, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss']
})
export class DividerComponent implements OnInit, OnDestroy {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() color: string = '#000000';
  @Input() thickness: number = 1;
  @Output() positionChange = new EventEmitter<number>();

  private isDragging = false;
  private startPosition = 0;
  private startPercentage = 50;
  public position = 50; // default to 50%

  private destroy$ = new Subject<void>();
  private mouseMoveSubject = new Subject<MouseEvent>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.mouseMoveSubject.pipe(
      takeUntil(this.destroy$),
      throttleTime(32) // Throttle to approximately 60fps
    ).subscribe(this.handleMouseMove);

    fromEvent<MouseEvent>(document, 'mousemove').pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => this.mouseMoveSubject.next(event));

    fromEvent(document, 'mouseup').pipe(
      takeUntil(this.destroy$)
    ).subscribe(this.onMouseUp);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMouseDown = (event: MouseEvent) => {
    this.isDragging = true;
    this.startPosition = this.orientation === 'horizontal' ? event.clientY : event.clientX;
    this.startPercentage = this.position;
    event.preventDefault(); // Prevent text selection
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return;

    const currentPosition = this.orientation === 'horizontal' ? event.clientY : event.clientX;
    const containerRect = this.elementRef.nativeElement.parentElement.getBoundingClientRect();
    const containerSize = this.orientation === 'horizontal' ? containerRect.height : containerRect.width;

    const delta = currentPosition - this.startPosition;
    const deltaPercentage = (delta / containerSize) * 100;

    this.position = Math.min(Math.max(this.startPercentage + deltaPercentage, 0), 100);
    this.positionChange.emit(this.position);
  }

  onMouseUp = () => {
    this.isDragging = false;
  }
}
