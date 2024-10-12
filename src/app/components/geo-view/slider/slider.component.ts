import { Component, EventEmitter, Output, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  @Output() positionChange = new EventEmitter<number>();
  @ViewChild('slider', { static: true }) sliderElement!: ElementRef;

  private isDragging = false;
  private containerWidth = 0;
  private currentPosition = 50;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.setPosition(this.currentPosition);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const containerRect = this.el.nativeElement.parentElement.getBoundingClientRect();
      const position = ((event.clientX - containerRect.left) / containerRect.width) * 100;
      this.setPosition(position);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  setPosition(position: number) {
    position = Math.max(0, Math.min(100, position));
    if (position !== this.currentPosition) {
      this.currentPosition = position;
      this.el.nativeElement.style.left = `${position}%`;
      this.positionChange.emit(position);
    }
  }
}
