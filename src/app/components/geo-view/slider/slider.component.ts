import { Component, EventEmitter, Output, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements AfterViewInit {
  @Output() positionChange = new EventEmitter<number>();

  @ViewChild('slider', { static: true }) sliderElement!: ElementRef;

  isSliding = false;
  containerWidth = 0;
  sliderWidth = 0;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    // Ensure the container and slider sizes are set after the view is initialized
    const parentElement = this.el.nativeElement.parentElement;
    this.containerWidth = parentElement.offsetWidth;
    this.sliderWidth = this.sliderElement.nativeElement.offsetWidth;
    console.log('Container width:', this.containerWidth, 'Slider width:', this.sliderWidth);
  }

  // Mouse down triggers sliding
  onMouseDown(event: MouseEvent) {
    this.isSliding = true;
    console.log('Mouse down event:', event);
  }

  // Capture mouse movement only when sliding is active
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isSliding) return;

    const newLeft = this.calculateSliderPosition(event.clientX);
    this.sliderElement.nativeElement.style.left = `${newLeft}px`;  // Move the slider dynamically

    const newPosition = (newLeft / this.containerWidth) * 100;  // Calculate position as percentage
    this.positionChange.emit(newPosition);  // Emit the slider's new position
    console.log('Mouse move event:', event, 'New slider position:', newPosition);
  }

  // Mouse up stops the sliding
  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isSliding) {
      console.log('Mouse up event');
      this.isSliding = false;
    }
  }

  // Calculate the new slider position based on mouse X position
  calculateSliderPosition(mouseX: number): number {
    const containerOffsetLeft = this.el.nativeElement.parentElement.getBoundingClientRect().left;
    let newLeft = mouseX - containerOffsetLeft;

    // Ensure the slider doesn't go outside the container
    if (newLeft < 0) newLeft = 0;
    if (newLeft > this.containerWidth - this.sliderWidth) newLeft = this.containerWidth - this.sliderWidth;

    return newLeft;
  }
}
