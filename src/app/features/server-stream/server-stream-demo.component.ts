import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DemoApiService } from '../../services/demo-api.service';
import { CourseSummary } from '../../models/demo.models';

@Component({
  selector: 'app-server-stream-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card demo-panel">
      <div class="card-header">
        <h2 class="mb-0">Course catalog stream</h2>
        <p class="text-secondary small mb-0 mt-1">Server streaming via SSE — <code>streamCourseCatalog</code></p>
      </div>
      <div class="card-body">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
          <button type="button" class="btn btn-primary" (click)="startStream()" [disabled]="streaming">
            Start stream
          </button>
          <button type="button" class="btn btn-outline-secondary" (click)="stopStream()" [disabled]="!streaming">
            Stop
          </button>
          @if (streaming) {
            <span class="badge rounded-pill status-live">● Live</span>
          } @else if (completed) {
            <span class="badge rounded-pill status-done">✓ Complete</span>
          }
        </div>

        @if (streaming) {
          <div class="progress mb-3" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
          </div>
        }

        @if (error) {
          <div class="alert alert-danger py-2" role="alert">{{ error }}</div>
        }

        @if (courses.length) {
          <div class="course-grid">
            @for (course of courses; track course.courseId) {
              <article class="course-tile" [class.visible]="receivedIds.has(course.courseId)">
                <div class="code">{{ course.courseCode }}</div>
                <h3>{{ course.courseName }}</h3>
                <p>{{ course.credits }} credits</p>
              </article>
            }
          </div>
        } @else if (!streaming && !completed) {
          <p class="text-secondary small mb-0">Click "Start stream" to receive courses one by one from the server.</p>
        }

        @if (completed) {
          <p class="text-success small mt-3 mb-0">{{ courses.length }} courses received.</p>
        }
      </div>
    </div>
  `
})
export class ServerStreamDemoComponent implements OnDestroy {
  courses: CourseSummary[] = [];
  receivedIds = new Set<number>();
  streaming = false;
  completed = false;
  error: string | null = null;
  private subscription?: Subscription;

  constructor(private readonly api: DemoApiService) {}

  startStream(): void {
    this.stopStream();
    this.courses = [];
    this.receivedIds = new Set();
    this.completed = false;
    this.error = null;
    this.streaming = true;

    this.subscription = this.api.streamCourseCatalog().subscribe({
      next: course => {
        this.courses = [...this.courses, course];
        this.receivedIds = new Set([...this.receivedIds, course.courseId]);
      },
      error: err => {
        this.error = err.message ?? 'Stream failed';
        this.streaming = false;
      },
      complete: () => {
        this.streaming = false;
        this.completed = true;
      }
    });
  }

  stopStream(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.streaming = false;
  }

  ngOnDestroy(): void {
    this.stopStream();
  }
}
