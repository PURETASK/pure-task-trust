// Shared application-level types

export type JobStatus =
  | 'requested'
  | 'accepted'
  | 'on_my_way'
  | 'in_progress'
  | 'awaiting_approval'
  | 'completed'
  | 'cancelled'
  | 'disputed';
