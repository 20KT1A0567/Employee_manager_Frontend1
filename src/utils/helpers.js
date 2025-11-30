
export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'present': return '#4caf50';
    case 'late': return '#ff9800';
    case 'absent': return '#f44336';
    case 'half-day': return '#ff5722';
    default: return '#9e9e9e';
  }
};

export const sumHours = (records) => {
  return records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
};

export const formatDuration = (hours) => {
  if (!hours) return '0h 0m';
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};