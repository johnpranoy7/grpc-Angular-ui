import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { DemoApiService, CatalogService } from '../../services/demo-api.service';
import {
  BatchEnrollResponse,
  CourseSummary,
  EnrollmentRequest,
  StudentSummary
} from '../../models/demo.models';

@Component({
  selector: 'app-client-stream-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <section class="demo-card">
      <div class="demo-card-header">
        <h2>Client Streaming — Batch Enroll</h2>
        <p>Many requests, one summary response · <code>batchConsumeEnrollStudents</code></p>
      </div>
      <div class="demo-card-body">
        @for (row of rows; track $index; let i = $index) {
          <div class="enroll-row">
            <mat-form-field appearance="outline">
              <mat-label>Student</mat-label>
              <mat-select [(ngModel)]="row.studentId">
                @for (student of students; track student.studentId) {
                  <mat-option [value]="student.studentId">
                    {{ student.firstName }} {{ student.lastName }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Course</mat-label>
              <mat-select [(ngModel)]="row.courseId">
                @for (course of courses; track course.courseId) {
                  <mat-option [value]="course.courseId">
                    {{ course.courseName }} ({{ course.courseCode }})
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Term</mat-label>
              <input matInput [(ngModel)]="row.term" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Grade</mat-label>
              <input matInput type="number" step="0.1" [(ngModel)]="row.grade" />
            </mat-form-field>

            @if (rows.length > 1) {
              <button mat-icon-button type="button" (click)="removeRow(i)" aria-label="Remove row">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        }

        <div class="actions">
          <button mat-stroked-button (click)="addRow()">+ Add enrollment</button>
          <button mat-flat-button color="primary" (click)="submitBatch()" [disabled]="loading">
            Submit Batch
          </button>
        </div>

        @if (error) {
          <p class="error-text">{{ error }}</p>
        }

        @if (result) {
          <div class="result-panel">
            <div class="stat success-stat">
              <span class="stat-value">{{ result.successCount }}</span>
              <span class="stat-label">Succeeded</span>
            </div>
            <div class="stat fail-stat">
              <span class="stat-value">{{ result.failureCount }}</span>
              <span class="stat-label">Failed</span>
            </div>
          </div>

          @if (result.failures?.length) {
            <ul class="failure-list">
              @for (failure of result.failures; track failure.studentId + '-' + failure.courseId) {
                <li>
                  <span class="status-chip" [class]="failure.reasonCode">{{ failure.reasonCode }}</span>
                  <strong>{{ studentLabel(failure.studentId) }}</strong>
                  → {{ courseLabel(failure.courseId) }}
                  <p>{{ failure.message }}</p>
                </li>
              }
            </ul>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .enroll-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(140px, 1fr)) auto;
      gap: 0.75rem;
      align-items: start;
      margin-bottom: 0.75rem;
      padding: 0.85rem;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid var(--border);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .result-panel {
      display: flex;
      gap: 1rem;
      margin-top: 1.25rem;
    }

    .stat {
      flex: 1;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
    }

    .success-stat { background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.25); }
    .fail-stat { background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.25); }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }

    .success-stat .stat-value { color: var(--success); }
    .fail-stat .stat-value { color: var(--danger); }

    .stat-label {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.8rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .failure-list {
      list-style: none;
      margin: 1rem 0 0;
      padding: 0;
    }

    .failure-list li {
      padding: 0.85rem;
      margin-bottom: 0.5rem;
      border-radius: 10px;
      background: rgba(248, 113, 113, 0.08);
      border: 1px solid rgba(248, 113, 113, 0.2);
    }

    .failure-list p {
      margin: 0.35rem 0 0;
      color: var(--muted);
      font-size: 0.9rem;
    }

    code { color: #7dd3fc; font-size: 0.85em; }

    @media (max-width: 900px) {
      .enroll-row {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
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
