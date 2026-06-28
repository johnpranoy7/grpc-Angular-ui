import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoApiService, CatalogService } from '../../services/demo-api.service';
import { StudentProfile, StudentSummary } from '../../models/demo.models';

@Component({
  selector: 'app-unary-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card demo-panel">
      <div class="card-header">
        <h2 class="mb-0">Student profile lookup</h2>
        <p class="text-secondary small mb-0 mt-1">Unary RPC — <code>getStudentProfile</code></p>
      </div>
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-6 col-lg-5">
            <label for="studentSelect" class="form-label">Student</label>
            <select id="studentSelect" class="form-select" [(ngModel)]="studentId">
              @for (student of students; track student.studentId) {
                <option [ngValue]="student.studentId">
                  {{ student.firstName }} {{ student.lastName }} — {{ student.program }}
                </option>
              }
            </select>
          </div>
          <div class="col-md-auto">
            <button type="button" class="btn btn-primary" (click)="fetchProfile()" [disabled]="loading || !studentId">
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-1" role="status"></span>
              }
              Fetch profile
            </button>
          </div>
        </div>

        @if (error) {
          <div class="alert alert-danger mt-3 mb-0 py-2" role="alert">{{ error }}</div>
        }

        @if (profile) {
          <div class="profile-result">
            <div class="profile-hero">
              <div class="profile-avatar">{{ profile.firstName.charAt(0) }}{{ profile.lastName.charAt(0) }}</div>
              <div>
                <h3>{{ profile.firstName }} {{ profile.lastName }}</h3>
                <p class="email">{{ profile.email }}</p>
              </div>
              <span class="gpa-badge">GPA {{ profile.gpa }}</span>
            </div>

            <dl class="stat-pills mb-3">
              <div class="stat-pill">
                <dt>Program</dt>
                <dd>{{ profile.program }}</dd>
              </div>
              <div class="stat-pill">
                <dt>Semester</dt>
                <dd>{{ profile.currentSemester }}</dd>
              </div>
              <div class="stat-pill">
                <dt>Enrollments</dt>
                <dd>{{ profile.enrolledCourses.length }}</dd>
              </div>
            </dl>

            @if (profile.enrolledCourses.length) {
              <div class="table-responsive">
                <table class="table demo-table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Term</th>
                      <th>Status</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (course of profile.enrolledCourses; track course.courseId + course.term) {
                      <tr>
                        <td>{{ course.courseName }}</td>
                        <td>{{ course.term }}</td>
                        <td>{{ course.status }}</td>
                        <td>{{ course.grade }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-secondary small mb-0">No enrollments on record.</p>
            }
          </div>
        }
      </div>
    </div>
  `
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
