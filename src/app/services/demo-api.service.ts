import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BatchEnrollResponse,
  CourseSummary,
  DemoEnrollmentResetResponse,
  EnrollmentRequest,
  StudentProfile,
  StudentSummary
} from '../models/demo.models';

@Injectable({ providedIn: 'root' })
export class DemoApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/demo`;

  constructor(private readonly http: HttpClient) {}

  getStudentProfile(studentId: number): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.baseUrl}/students/${studentId}`);
  }

  listStudents(): Observable<StudentSummary[]> {
    return this.http.get<StudentSummary[]>(`${this.baseUrl}/catalog/students`);
  }

  listCourses(): Observable<CourseSummary[]> {
    return this.http.get<CourseSummary[]>(`${this.baseUrl}/catalog/courses`);
  }

  streamCourseCatalog(): Observable<CourseSummary> {
    return new Observable<CourseSummary>(observer => {
      const eventSource = new EventSource(`${this.baseUrl}/courses/stream`);

      eventSource.addEventListener('course', (event: MessageEvent<string>) => {
        observer.next(JSON.parse(event.data) as CourseSummary);
      });

      eventSource.addEventListener('complete', () => {
        observer.complete();
        eventSource.close();
      });

      eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          observer.complete();
        } else {
          observer.error(new Error('Course catalog stream failed'));
        }
        eventSource.close();
      };

      return () => eventSource.close();
    });
  }

  batchEnroll(enrollments: EnrollmentRequest[]): Observable<BatchEnrollResponse> {
    return this.http.post<BatchEnrollResponse>(`${this.baseUrl}/enrollments/batch`, enrollments);
  }

  resetDemoEnrollments(): Observable<DemoEnrollmentResetResponse> {
    return this.http.post<DemoEnrollmentResetResponse>(`${this.baseUrl}/admin/reset-enrollments`, {});
  }

  getWebSocketUrl(): string {
    return environment.wsUrl;
  }
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private students$?: Observable<StudentSummary[]>;
  private courses$?: Observable<CourseSummary[]>;

  constructor(private readonly api: DemoApiService) {}

  loadStudents(): Observable<StudentSummary[]> {
    if (!this.students$) {
      this.students$ = this.api.listStudents().pipe(shareReplay(1));
    }
    return this.students$;
  }

  loadCourses(): Observable<CourseSummary[]> {
    if (!this.courses$) {
      this.courses$ = this.api.listCourses().pipe(shareReplay(1));
    }
    return this.courses$;
  }

  studentLabel(studentId: number, students: StudentSummary[]): string {
    const student = students.find(s => s.studentId === studentId);
    return student ? `${student.firstName} ${student.lastName}` : `Student #${studentId}`;
  }

  courseLabel(courseId: number, courses: CourseSummary[]): string {
    const course = courses.find(c => c.courseId === courseId);
    return course ? `${course.courseName} (${course.courseCode})` : `Course #${courseId}`;
  }
}
