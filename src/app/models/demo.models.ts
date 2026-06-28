export interface EnrolledCourse {
  courseId: number;
  courseName: string;
  term: string;
  status: string;
  grade: number;
}

export interface StudentProfile {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  currentSemester: number;
  gpa: number;
  enrollmentDate: string | null;
  enrolledCourses: EnrolledCourse[];
}

export interface StudentSummary {
  studentId: number;
  firstName: string;
  lastName: string;
  program: string;
  gpa: number;
}

export interface CourseSummary {
  courseId: number;
  courseName: string;
  courseCode: string;
  credits: string;
}

export interface EnrollmentRequest {
  studentId: number;
  courseId: number;
  term: string;
  status: string;
  grade: number;
}

export interface FailedEnrollment {
  studentId: number;
  courseId: number;
  reasonCode: string;
  message: string;
}

export interface BatchEnrollResponse {
  successCount: number;
  failureCount: number;
  failedStudentIds: string[];
  failures: FailedEnrollment[];
}

export interface EnrollmentIntent {
  studentId: number;
  courseId: number;
  term: string;
  status: string;
  grade: number;
}

export interface EnrollmentFeedback {
  studentId: number;
  courseId: number;
  status: string;
  message: string;
  projectedGpa: number;
  persisted: boolean;
}

export interface WebSocketFeedbackMessage {
  type: 'FEEDBACK';
  payload: EnrollmentFeedback;
}

export interface WebSocketControlMessage {
  type: 'SESSION_STARTED' | 'ERROR';
  message: string;
}
