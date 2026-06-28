import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DemoApiService, CatalogService } from '../../services/demo-api.service';
import { StudentProfile, StudentSummary } from '../../models/demo.models';

@Component({
  selector: 'app-unary-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="demo-card">
      <div class="demo-card-header">
        <h2>Unary — Student Profile</h2>
        <p>One request, one response · <code>getStudentProfile</code></p>
      </div>
      <div class="demo-card-body">
        <div class="controls">
          <mat-form-field appearance="outline">
            <mat-label>Select student</mat-label>
            <mat-select [(ngModel)]="studentId">
              @for (student of students; track student.studentId) {
                <mat-option [value]="student.studentId">
                  {{ student.firstName }} {{ student.lastName }} · {{ student.program }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button mat-flat-button color="primary" (click)="fetchProfile()" [disabled]="loading || !studentId">
            Fetch Profile
          </button>
        </div>

        @if (loading) {
          <mat-spinner diameter="36"></mat-spinner>
        }

        @if (error) {
          <p class="error-text">{{ error }}</p>
        }

        @if (profile) {
          <div class="profile-card">
            <div class="profile-header">
              <div class="avatar">{{ profile.firstName.charAt(0) }}{{ profile.lastName.charAt(0) }}</div>
              <div>
                <h3>{{ profile.firstName }} {{ profile.lastName }}</h3>
                <p>{{ profile.email }}</p>
              </div>
              <span class="gpa-pill">GPA {{ profile.gpa }}</span>
            </div>
            <div class="profile-grid">
              <div><span>Program</span><strong>{{ profile.program }}</strong></div>
              <div><span>Semester</span><strong>{{ profile.currentSemester }}</strong></div>
              <div><span>Enrollments</span><strong>{{ profile.enrolledCourses.length }}</strong></div>
            </div>
            @if (profile.enrolledCourses.length) {
              <ul class="enrollment-list">
                @for (course of profile.enrolledCourses; track course.courseId + course.term) {
                  <li>
                    <strong>{{ course.courseName }}</strong>
                    <span>{{ course.term }} · {{ course.status }} · Grade {{ course.grade }}</span>
                  </li>
                }
              </ul>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    mat-form-field { max-width: 360px; }
    mat-spinner { margin-top: 1rem; }

    .profile-card {
      margin-top: 1.25rem;
      padding: 1.25rem;
      border-radius: 12px;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      font-weight: 700;
      color: white;
    }

    .profile-header h3 { margin: 0; color: #f8fafc; }
    .profile-header p { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.9rem; }
    .gpa-pill {
      margin-left: auto;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(74, 222, 128, 0.15);
      color: var(--success);
      font-weight: 600;
      font-size: 0.85rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .profile-grid span {
      display: block;
      font-size: 0.75rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .enrollment-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .enrollment-list li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.65rem 0;
      border-top: 1px solid var(--border);
      font-size: 0.9rem;
    }

    .enrollment-list span { color: var(--muted); }
    code { color: #7dd3fc; font-size: 0.85em; }
  `]
})
export class UnaryDemoComponent implements OnInit {
  students: StudentSummary[] = [];
  studentId = 1;
  loading = false;
  error: string | null = null;
  profile: StudentProfile | null = null;

  constructor(
    private readonly api: DemoApiService,
    private readonly catalog: CatalogService
  ) {}

  ngOnInit(): void {
    this.catalog.loadStudents().subscribe({
      next: students => {
        this.students = students;
        if (students.length) {
          this.studentId = students[0].studentId;
        }
      },
      error: () => this.error = 'Could not load student catalog'
    });
  }

  fetchProfile(): void {
    this.loading = true;
    this.error = null;
    this.profile = null;

    this.api.getStudentProfile(this.studentId).subscribe({
      next: profile => {
        this.profile = profile;
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message ?? err.message ?? 'Request failed';
        this.loading = false;
      }
    });
  }
}
