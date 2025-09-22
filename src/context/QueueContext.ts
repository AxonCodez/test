
export type QueueUser = {
  uid: string;
  name: string;
  token: number;
};

export type Queue = {
  currentToken: number;
  totalTokens: number;
  users: QueueUser[];
};
