import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmpAddEditComponent } from './book-add-edit/book-add-edit.component';
import { EmployeeService } from './services/Book.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreService } from './core/core.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'author',
    'genre',
    'publication_date',
    'isbn',
    'action'
  ];

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dialog: MatDialog,
    private _empService: EmployeeService,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.getEmployeeList();
  }

  openAddEditEmpForm() {
    const dialogRef = this._dialog.open(EmpAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
  }

  getEmployeeList() {
    this._empService.getEmployeeList().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: console.log,
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteEmployee(entry_id: number) {
    this._empService.deleteEmployee(entry_id).subscribe({
      next: (res) => {
        this._coreService.openSnackBar('Book deleted!', 'done');
        this.getEmployeeList();
      },
      error: console.log,
    });
  }

  openEditForm(data: any) {
    const dialogRef = this._dialog.open(EmpAddEditComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
  }

  
  exportToCSV() {
    const csvData = this.convertToCSV(this.dataSource.data);
    this.downloadCSV(csvData, 'book_data.csv');
  }


  convertToCSV(data: any[]): string {
    const header = ['Title', 'Author', 'Genre', 'Publication Date', 'ISBN']; // Column headers
    const rows = data.map(item => [
      item.title,
      item.author,
      item.genre,
      item.publication_date,
      item.isbn
    ]);

    // Combine header and rows
    const csvContent = [header, ...rows].map(row => row.join(',')).join('\n');
    return csvContent;
  }

  // Trigger download of the CSV file
  downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // Create a link to the file
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
