export class Notification {
  id: number;
  userId: number;
  title: string;
  type: 'success' | 'warning' | 'info';
  createdAt: Date;
  read?: boolean;
}
