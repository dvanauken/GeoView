import { Component } from '@angular/core';

interface StyleRow {
  al: string;
  base: string;
  ref: string;
  strokeColor: string;
  fillColor: string;
  style: string;
  isEditing?: boolean;
}

@Component({
  selector: 'style-editor',
  templateUrl: './style-editor.component.html',
  styleUrls: ['./style-editor.component.scss']
})
export class StyleEditorComponent {
  displayedColumns: string[] = ['al', 'base', 'ref', 'strokeColor', 'fillColor', 'style', 'actions'];
  styles: string[] = ['solid', 'dashed', 'dotted'];  // D3 line styles

  dataSource: StyleRow[] = [
    { al: 'SampleAl', base: 'SampleBase', ref: 'SampleRef', strokeColor: '#000000', fillColor: '#FFFFFF', style: 'solid', isEditing: false }
  ];

  addRow() {
    // Add a new row at the top, in editing mode
    const newRow: StyleRow = {
      al: '',
      base: '',
      ref: '',
      strokeColor: '#000000',
      fillColor: '#FFFFFF',
      style: 'solid',
      isEditing: true  // Set to true to start editing mode immediately
    };

    this.dataSource = [newRow, ...this.dataSource];  // Assign a new array to trigger change detection
  }


  editRow(row: StyleRow) {
    row.isEditing = true;
  }

  saveRow(row: StyleRow) {
    row.isEditing = false;
  }

  cancelEdit(row: StyleRow) {
    if (!row.al && !row.base && !row.ref) {
      // Remove row if it's empty and a new entry
      const index = this.dataSource.indexOf(row);
      if (index > -1) {
        this.dataSource.splice(index, 1);
      }
    } else {
      row.isEditing = false;
    }
  }
}
