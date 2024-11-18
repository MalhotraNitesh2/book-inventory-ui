import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { EmployeeService } from '../services/Book.service';

@Component({
  selector: 'app-book-add-edit',
  templateUrl: './book-add-edit.component.html',
  styleUrls: ['./book-add-edit.component.scss'],
})
export class EmpAddEditComponent implements OnInit {
  empForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _empService: EmployeeService,
    private _dialogRef: MatDialogRef<EmpAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
  ) {
    // Include `entry_id` in the form
    this.empForm = this._fb.group({
      entry_id: '',
      title: '',
      author: '',
      genre: '',
      publication_date: '',
      isbn: '',
    });
  }

  ngOnInit(): void {
    if (this.data) {
      const formattedData = { ...this.data };

      // Format publication_date if available
      if (formattedData.publication_date) {
        const date = new Date(formattedData.publication_date);
        formattedData.publication_date = date.toISOString().split('T')[0];
      }
      this.empForm.patchValue(formattedData);
    }
  }

  
  onFormSubmit() {
    if (this.empForm.valid) {
      // Prepare form data
      const formData = { ...this.empForm.value };

      // Format publication_date before submission
      if (formData.publication_date) {
        const date = new Date(formData.publication_date);
        formData.publication_date = date.toISOString().split('T')[0];
      }
      if (this.data) {
        this._empService.updateEmployee(this.data.entry_id, formData).subscribe({
          next: (val: any) => {
            this._coreService.openSnackBar('Book detail updated!');
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      } else {
        // Add new entry logic
        this._empService.addEmployee(formData).subscribe({
          next: (val: any) => {
            this._coreService.openSnackBar('Book added successfully');
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      }
    }
  }
}
