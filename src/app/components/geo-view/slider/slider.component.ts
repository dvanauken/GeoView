import {
  Component,
  EventEmitter,
  Output,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { throttle } from 'lodash';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() positionChange = new EventEmitter<number>();
  @ViewChild('sliderHandle', { static: true }) sliderHandle!: ElementRef;

  private isDragging = false;
  currentPosition = 50; // Make this public

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setPosition(this.currentPosition);
  }

  ngAfterViewInit() {
    this.setPosition(this.currentPosition); // Ensure handle is positioned after view init
    this.cdr.detectChanges(); // Force change detection
  }

  ngOnDestroy() {
    // Clean up any subscriptions if needed
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.updatePositionFromEvent(event);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.updatePositionFromEvent(event);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.positionChange.emit(this.currentPosition);
    }
  }

  private updatePositionFromEvent(event: MouseEvent) {
    const containerRect = this.el.nativeElement.getBoundingClientRect();
    const position = ((event.clientX - containerRect.left) / containerRect.width) * 100;
    this.setPosition(position);
  }

  private setPosition(position: number) {
    this.currentPosition = Math.max(0, Math.min(100, position));
    if (this.sliderHandle) {
      this.sliderHandle.nativeElement.style.left = `${this.currentPosition}%`;
    }
    this.positionChange.emit(this.currentPosition);
    this.cdr.detectChanges(); // Ensure changes are detected
  }
}
