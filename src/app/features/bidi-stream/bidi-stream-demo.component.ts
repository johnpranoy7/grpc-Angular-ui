import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  EnrollmentFeedback,
  EnrollmentIntent,
  CourseSummary,
  StudentSummary,
  WebSocketControlMessage
} from '../../models/demo.models';
import { DemoApiService, CatalogService } from '../../services/demo-api.service';

interface ChatMessage {
  direction: 'sent' | 'received';
  text: string;
  status?: string;
}

@Component({
  selector: 'app-bidi-stream-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <section class="demo-card">
      <div class="demo-card-header">
        <h2>Bidirectional — Live Advising</h2>
        <p>Many ↔ many · <code>liveEnrollmentAdvising</code> via WebSocket</p>
      </div>
      <div class="demo-card-body">
        <div class="session-bar">
          @if (!connected) {
            <button mat-flat-button color="primary" (click)="connect()">Connect session</button>
          } @else {
            <button mat-stroked-button color="warn" (click)="disconnect()">Disconnect</button>
            <span class="badge streaming">● Connected</span>
          }
        </div>

        <div class="intent-form">
          <mat-form-field appearance="outline">
            <mat-label>Student</mat-label>
            <mat-select [(ngModel)]="intent.studentId">
              @for (student of students; track student.studentId) {
                <mat-option [value]="student.studentId">
                  {{ student.firstName }} {{ student.lastName }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Course</mat-label>
            <mat-select [(ngModel)]="intent.courseId">
              @for (course of courses; track course.courseId) {
                <mat-option [value]="course.courseId">
                  {{ course.courseName }} ({{ course.courseCode }})
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Term</mat-label>
            <input matInput [(ngModel)]="intent.term" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Grade</mat-label>
            <input matInput type="number" step="0.1" [(ngModel)]="intent.grade" />
          </mat-form-field>

          <button mat-flat-button (click)="sendIntent()" [disabled]="!connected">Send intent</button>
        </div>

        <div class="chat-panel">
          @for (msg of messages; track $index) {
            <div [class]="'bubble ' + msg.direction">
              @if (msg.status) {
                <span class="status-chip" [class]="msg.status">{{ msg.status }}</span>
              }
              <span>{{ msg.text }}</span>
            </div>
          } @empty {
            <p class="chat-empty">Connect and send an enrollment intent to see live advisor feedback.</p>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .session-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .intent-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
      align-items: start;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid var(--border);
    }

    .chat-panel {
      max-height: 380px;
      overflow-y: auto;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.6);
    }

    .chat-empty {
      margin: 0;
      color: var(--muted);
      text-align: center;
      font-style: italic;
      padding: 2rem 1rem;
    }

    .bubble {
      margin-bottom: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      max-width: 88%;
      line-height: 1.45;
      font-size: 0.92rem;
    }

    .bubble.sent {
      margin-left: auto;
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(99, 102, 241, 0.25));
      border: 1px solid rgba(56, 189, 248, 0.3);
      text-align: right;
    }

    .bubble.received {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
    }

    code { color: #7dd3fc; font-size: 0.85em; }
  `]
})
export class BidiStreamDemoComponent implements OnInit, OnDestroy {
  connected = false;
  messages: ChatMessage[] = [];
  students: StudentSummary[] = [];
  courses: CourseSummary[] = [];
  intent: EnrollmentIntent = {
    studentId: 4,
    courseId: 3,
    term: 'Fall 2025',
    status: 'Enrolled',
    grade: 3.5
  };

  private socket?: WebSocket;

  constructor(
    private readonly api: DemoApiService,
    private readonly catalog: CatalogService
  ) {}

  ngOnInit(): void {
    this.catalog.loadStudents().subscribe(students => this.students = students);
    this.catalog.loadCourses().subscribe(courses => this.courses = courses);
  }

  connect(): void {
    this.messages = [];
    this.socket = new WebSocket(this.api.getWebSocketUrl());

    this.socket.onopen = () => {
      this.connected = true;
    };

    this.socket.onmessage = (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data);

      if (data.type === 'FEEDBACK') {
        this.appendFeedback(data.payload as EnrollmentFeedback);
        return;
      }

      const control = data as WebSocketControlMessage;
      this.messages.push({ direction: 'received', text: control.message });
    };

    this.socket.onerror = () => {
      this.messages.push({ direction: 'received', text: 'WebSocket error' });
    };

    this.socket.onclose = () => {
      this.connected = false;
    };
  }

  sendIntent(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const studentName = this.catalog.studentLabel(this.intent.studentId, this.students);
    const courseName = this.catalog.courseLabel(this.intent.courseId, this.courses);

    this.messages.push({
      direction: 'sent',
      text: `Enroll ${studentName} in ${courseName} for ${this.intent.term} (grade ${this.intent.grade})`
    });
    this.socket.send(JSON.stringify(this.intent));
  }

  disconnect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send('CLOSE');
      this.socket.close();
    }
    this.connected = false;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private appendFeedback(feedback: EnrollmentFeedback): void {
    const studentName = this.catalog.studentLabel(feedback.studentId, this.students);
    const courseName = this.catalog.courseLabel(feedback.courseId, this.courses);
    let text = feedback.message;
    if (feedback.persisted) {
      text += ` · Projected GPA: ${feedback.projectedGpa}`;
    }
    text = `${studentName} · ${courseName}: ${text}`;
    this.messages.push({ direction: 'received', text, status: feedback.status });
  }
}
