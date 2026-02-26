export function getStatusColor(status) {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': case 'delivered': return 'success';
    case 'cancelled': return 'error';
    default: return 'warning';
  }
}
