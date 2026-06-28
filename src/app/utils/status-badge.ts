export function enrollmentStatusBadge(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'text-bg-success';
    case 'GPA_WARNING':
      return 'text-bg-warning';
    case 'ALREADY_ENROLLED':
    case 'COURSE_FULL':
    case 'STUDENT_NOT_FOUND':
    case 'COURSE_NOT_FOUND':
    case 'INVALID_TERM':
    case 'ERROR':
      return 'text-bg-danger';
    default:
      return 'text-bg-secondary';
  }
}
