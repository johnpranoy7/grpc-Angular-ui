import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { DemoApiService } from '../../services/demo-api.service';
import { CourseSummary } from '../../models/demo.models';

@Component({
  selector: 'app-server-stream-demo',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressBarModule],
  template: `
    <section class="demo-card">
      <div class="demo-card-header">
        <h2>Server Streaming — Course Catalog</h2>
        <p>One request, many responses · <code>streamCourseCatalog</code> via SSE</p>
      </div>
      <div class="demo-card-body">
        <div class="toolbar">
          <button mat-flat-button color="primary" (click)="startStream()" [disabled]="streaming">
            Start Stream
          </button>
          <button mat-stroked-button (click)="stopStream()" [disabled]="!streaming">
            Stop
          </button>
          @if (streaming) {
            <span class="badge streaming">● Live</span>
          } @else if (completed) {
            <span class="badge done">✓ Complete</span>
          }
        </div>

        @if (streaming) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }

        @if (error) {
          <p class="error-text">{{ error }}</p>
        }

        <div class="course-grid">
          @for (course of courses; track course.courseId) {
            <article class="course-tile" [class.received]="receivedIds.has(course.courseId)">
              <div class="course-code">{{ course.courseCode }}</div>
              <h3>{{ course.courseName }}</h3>
              <p>{{ course.credits }} credits</p>
            </article>
          } @empty {
            @if (!streaming && !completed) {
              <p class="hint">Click Start Stream to receive courses one by one from the server.</p>
            }
          }
        </div>

        @if (completed) {
          <p class="success-text">Stream finished — {{ courses.length }} courses received.</p>
        }
      </div>
    </section>
  `,
  styles: [`
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    mat-progress-bar { margin-bottom: 1rem; border-radius: 4px; }

    .course-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.85rem;
      margin-top: 0.5rem;
    }

    .course-tile {
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: rgba(15, 23, 42, 0.5);
      opacity: 0.4;
      transform: translateY(6px);
      transition: all 0.35s ease;
    }

    .course-tile.received {
      opacity: 1;
      transform: translateY(0);
      border-color: rgba(56, 189, 248, 0.35);
      background: rgba(56, 189, 248, 0.08);
    }

    .course-code {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--accent);
      margin-bottom: 0.35rem;
    }

    .course-tile h3 {
      margin: 0;
      font-size: 1rem;
      color: #f8fafc;
    }

    .course-tile p {
      margin: 0.35rem 0 0;
      color: var(--muted);
      font-size: 0.85rem;
    }

    .hint { color: var(--muted); font-style: italic; }
    code { color: #7dd3fc; font-size: 0.85em; }
  `]
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
