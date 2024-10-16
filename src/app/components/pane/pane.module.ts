import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaneComponent } from './pane/pane.component';
import { DoublePaneComponent } from './double-pane/double-pane.component';

@NgModule({
  declarations: [PaneComponent, DoublePaneComponent],
  imports: [CommonModule],
  exports: [PaneComponent, DoublePaneComponent]
})
export class PaneModule { }
