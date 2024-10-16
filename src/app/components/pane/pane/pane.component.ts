import { Component, ElementRef, Renderer2, ChangeDetectorRef, AfterContentInit } from '@angular/core';

@Component({
  selector: 'app-pane',
  templateUrl: './pane.component.html',
  styleUrls: ['./pane.component.scss']
})
export class PaneComponent implements AfterContentInit {
  constructor(
    public elementRef: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterContentInit() {
    console.log('PaneComponent - ngAfterContentInit');
    //console.log('Pane content:', this.el.nativeElement.innerHTML);
  }

  setWidth(width: string) {
    console.log('Setting pane width:', width);
    this.renderer.setStyle(this.elementRef.nativeElement, 'width', width);
    this.cdr.detectChanges(); // Force change detection
  }
}
