export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return '#d32f2f';
    case 'high':
      return '#f57c00';
    case 'medium':
      return '#fbc02d';
    case 'low':
      return '#388e3c';
    default:
      return '#1976d2';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'open':
    case 'unreviewed':
      return '#d32f2f';
    case 'in_progress':
    case 'in progress':
      return '#f57c00';
    case 'closed':
    case 'resolved':
      return '#388e3c';
    case 'on_hold':
    case 'false_positive':
      return '#1976d2';
    default:
      return '#757575';
  }
};
