export interface Board {
  boardId: number;
  title: string;
  nickname: string;
  createdAt: number; // timestamp
  view: number;
  content?:string;
}

export const initBoard = {
    boardId: 0,
    title: 'string',
    nickname: '익명',
    createdAt: 0, // timestamp
    view: 0,
}