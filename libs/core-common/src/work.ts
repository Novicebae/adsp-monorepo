import { Observable } from 'rxjs';

export interface WorkItem<T> {
  item: T;
  retryOnError: boolean;
  done: (err?: unknown) => void;
}

export interface WorkQueueService<T> {
  enqueue(item: T): Promise<void>;
  getItems(): Observable<WorkItem<T>>;
}
