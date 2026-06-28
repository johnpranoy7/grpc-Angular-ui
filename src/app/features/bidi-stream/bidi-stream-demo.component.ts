import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EnrollmentFeedback,
  EnrollmentIntent,
  CourseSummary,
  StudentSummary,
  WebSocketControlMessage
} from '../../models/demo.models';
import { DemoApiService, CatalogService } from '../../services/demo-api.service';
import { enrollmentStatusBadge } from '../../utils/status-badge';

interface ChatMessage {
  direction: 'sent' | 'received';
  text: string;
  status?: string;
}

@Component({
  selector: 'app-bidi-stream-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card demo-panel">
      <div class="card-header">
        <h2 class="mb-0">Live enrollment advising</h2>
        <p class="text-secondary small mb-0 mt-1">Bidirectional stream via WebSocket — <code>liveEnrollmentAdvising</code></p>
      </div>
      <div class="card-body">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
          @if (!connected) {
            <button type="button" class="btn btn-primary" (click)="connect()">Connect session</button>
          } @else {
            <button type="button" class="btn btn-outline-secondary" (click)="disconnect()">Disconnect</button>
            <span class="badge rounded-pill status-live">● Connected</span>
          }
        </div>

        <fieldset class="enroll-block mb-4" [disabled]="!connected">
          <legend>Enrollment intent</legend>
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Student</label>
              <select class="form-select" [(ngModel)]="intent.studentId">
                @for (student of students; track student.studentId) {
                  <option [ngValue]="student.studentId">
                    {{ student.firstName }} {{ student.lastName }}
                  </option>
                }
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Course</label>
              <select class="form-select" [(ngModel)]="intent.courseId">
                @for (course of courses; track course.courseId) {
                  <option [ngValue]="course.courseId">
                    {{ course.courseName }} ({{ course.courseCode }})
                  </option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Term</label>
              <input type="text" class="form-control" [(ngModel)]="intent.term" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Grade</label>
              <input type="number" step="0.1" class="form-control" [(ngModel)]="intent.grade" />
            </div>
            <div class="col-md-auto">
              <button type="button" class="btn btn-primary" (click)="sendIntent()" [disabled]="!connected">Send intent</button>
            </div>
          </div>
        </fieldset>

        <div class="chat-panel">
          @for (msg of messages; track $index) {
            <div class="chat-bubble" [class.sent]="msg.direction === 'sent'" [class.received]="msg.direction === 'received'">
              @if (msg.status) {
                <span class="badge d-inline-block mb-1" [class]="statusBadge(msg.status)">{{ msg.status }}</span><br>
              }
              {{ msg.text }}
            </div>
          } @empty {
            <p class="chat-empty">Connect and send an enrollment intent to see live advisor feedback.</p>
          }
        </div>
      </div>
    </div>
  `
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

  readonly statusBadge = enrollmentStatusBadge;

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
      this.messages.push({ direction: 'received', text: 'WebSocket error.' });
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
      text += ` (projected GPA: ${feedback.projectedGpa})`;
    }
    text = `${studentName} · ${courseName}: ${text}`;
    this.messages.push({ direction: 'received', text, status: feedback.status });
  }
}
