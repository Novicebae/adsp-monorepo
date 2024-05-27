export interface Feedback {
  timestamp: Date;
  correlationId: string;
  context: Context;
  value: Value;
}

export interface Context {
  site: string;
  view: string;
  digest: string;
  includesComment: boolean;
}

export interface Value {
  rating: Rating;
  comment: string;
  technicalIssue: string;
}

export enum Rating {
  'terrible' = 0,
  'bad' = 1,
  'neutral' = 2,
  'good' = 3,
  'delightful' = 4,
}

export interface Page {
  next: string;
  size: number;
}
export interface FeedbackSite {
  url: string;
  allowAnonymous: boolean;
  views?: [];
}

export interface FeedbackState {
  sites: FeedbackSite[];
  feedbacks: Feedback[];
  isLoading: boolean;
  nextEntries: string;
}

export const defaultFeedbackSite: FeedbackSite = {
  url: '',
  allowAnonymous: false,
  views: [],
};
