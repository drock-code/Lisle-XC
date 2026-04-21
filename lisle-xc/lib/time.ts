export function formatTime(timeString: string | null) {
  if (!timeString) return ''; 
  
  const [hourStr, minute] = timeString.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  hour = hour % 12 || 12; 
  
  return `${hour}:${minute} ${ampm}`;
}