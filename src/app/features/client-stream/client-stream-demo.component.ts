import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoApiService, CatalogService } from '../../services/demo-api.service';
import { enrollmentStatusBadge } from '../../utils/status-badge';
import {
  BatchEnrollResponse,
  CourseSummary,
  EnrollmentRequest,
  StudentSummary
} from '../../models/demo.models';

@Component({
  selector: 'app-client-stream-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card demo-panel">
      <div class="card-header">
        <h2 class="mb-0">Batch enrollment</h2>
        <p class="text-secondary small mb-0 mt-1">Client streaming — <code>batchConsumeEnrollStudents</code></p>
      </div>
      <div class="card-body">
        @for (row of rows; track $index; let i = $index) {
          <fieldset class="enroll-block">
            <legend>Enrollment {{ i + 1 }}</legend>
            <div class="row g-3 align-items-end">
              <div class="col-md-3">
                <label class="form-label">Student</label>
                <select class="form-select" [(ngModel)]="row.studentId">
                  @for (student of students; track student.studentId) {
                    <option [ngValue]="student.studentId">
                      {{ student.firstName }} {{ student.lastName }}
                    </option>
                  }
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Course</label>
                <select class="form-select" [(ngModel)]="row.courseId">
                  @for (course of courses; track course.courseId) {
                    <option [ngValue]="course.courseId">
                      {{ course.courseName }} ({{ course.courseCode }})
                    </option>
                  }
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">Term</label>
                <input type="text" class="form-control" [(ngModel)]="row.term" />
              </div>
              <div class="col-md-2">
                <label class="form-label">Grade</label>
                <input type="number" step="0.1" class="form-control" [(ngModel)]="row.grade" />
              </div>
              @if (rows.length > 1) {
                <div class="col-md-auto">
                  <button type="button" class="btn btn-outline-danger btn-sm" (click)="removeRow(i)" aria-label="Remove row">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              }
            </div>
          </fieldset>
        }

        <div class="d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-outline-secondary" (click)="addRow()">
            <i class="bi bi-plus-lg me-1"></i>Add enrollment
          </button>
          <button type="button" class="btn btn-primary" (click)="submitBatch()" [disabled]="loading">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-1" role="status"></span>
            }
            Submit batch
          </button>
        </div>

        @if (error) {
          <div class="alert alert-danger mt-3 mb-0 py-2" role="alert">{{ error }}</div>
        }

        @if (result) {
          <div class="result-stats">
            <div class="stat-box success">
              <span class="value">{{ result.successCount }}</span>
              <span class="label">Succeeded</span>
            </div>
            <div class="stat-box fail">
              <span class="value">{{ result.failureCount }}</span>
              <span class="label">Failed</span>
            </div>
          </div>

          @if (result.failures?.length) {
            <h4 class="h6 text-secondary mb-2">Rejected enrollments</h4>
            <div class="table-responsive">
              <table class="table demo-table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Reason</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  @for (failure of result.failures; track failure.studentId + '-' + failure.courseId) {
                    <tr>
                      <td>{{ studentLabel(failure.studentId) }}</td>
                      <td>{{ courseLabel(failure.courseId) }}</td>
                      <td>
                        <span class="badge" [class]="statusBadge(failure.reasonCode)">{{ failure.reasonCode }}</span>
                      </td>
                      <td class="small text-secondary">{{ failure.message }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ClientStreamDemoComponent implements OnInit {
  students: StudentSummary[] = [];
  courses: CourseSummary[] = [];
  rows: EnrollmentRequest[] = [
    { studentId: 4, courseId: 4, term: 'Fall 2025', status: 'Enrolled', grade: 3.5 }
  ];
  loading = false;
  error: string | null = null;
  result: BatchEnrollResponse | null = null;

  readonly statusBadge = enrollmentStatusBadge;

  constructor(
    private readonly api: DemoApiService,
    private readonly catalog: CatalogService
  ) {}

  ngOnInit(): void {
    this.catalog.loadStudents().subscribe(students => this.students = students);
    this.catalog.loadCourses().subscribe(courses => this.courses = courses);
  }

  studentLabel(studentId: number): string {
    return this.catalog.studentLabel(studentId, this.students);
  }

  courseLabel(courseId: number): string {
    return this.catalog.courseLabel(courseId, this.courses);
  }

  addRow(): void {
    const defaultStudent = this.students[1]?.studentId ?? 2;
    const defaultCourse = this.courses[0]?.courseId ?? 1;
    this.rows.push({
      studentId: defaultStudent,
      courseId: defaultCourse,
      term: 'Fall 2025',
      status: 'Enrolled',
      grade: 3.0
    });
  }

  removeRow(index: number): void {
    this.rows.splice(index, 1);
  }

  submitBatch(): void {
    this.loading = true;
    this.error = null;
    this.result = null;

    this.api.batchEnroll(this.rows).subscribe({
      next: result => {
        this.result = result;
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message ?? err.message ?? 'Batch failed';
        this.loading = false;
      }
    });
  }
}
