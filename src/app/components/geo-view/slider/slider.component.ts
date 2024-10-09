// slider.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-slider',
  template: '<input type="range" min="0" max="100" [value]="sliderPosition" (input)="onSliderInput($event)">',
  styles: [`
    input[type="range"] {
      width: 100%;
    }
  `]
})
export class SliderComponent {
  @Output() positionChange = new EventEmitter<number>();
  sliderPosition = 50; // Default to 50%

  onSliderInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.sliderPosition = Number(inputElement.value);
    this.positionChange.emit(this.sliderPosition);
  }
}
