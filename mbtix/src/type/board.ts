export interface Board {
  boardId: number;
  title: string;
  nickname: string;
  createdAt: number;
  view: number;
  content: string;    
  images: string[];
}

export const initBoard: Board = {
  boardId: 0,
  title: '',
  nickname: '익명',
  createdAt: 0,
  view: 0,
  content: '',      
  images: [],        
};
