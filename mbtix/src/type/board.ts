export interface Board {
  boardId: number;
  title: string;
  nickname: string;
  createdAt: number;
  view: number;
  content: string;    
  images: string[];
  userId: number;
  mbtiId? : number;
  mbtiName? : string;
  likeCount ? :number;
  dislikeCount ? :number;
}

export const initBoard: Board = {
  userId:0,
  boardId: 0,
  title: '',
  nickname: '익명',
  createdAt: 0,
  view: 0,
  content: '',      
  images: [],         
};

export interface MBTI  {
  mbtiId : number 
  mbtiName : string
}

export interface Category  {
  categoryId : number 
  categoryName : string
}

export const categorys:Category[] = [
    { categoryId: 1, categoryName: "ISTJ" },
    { categoryId: 2, categoryName: "ISFJ" },
    { categoryId: 3, categoryName: "INTJ" },
    { categoryId: 4, categoryName: "INFJ" },
    { categoryId: 5, categoryName: "ISTP" },
    { categoryId: 6, categoryName: "ISFP" },
    { categoryId: 7, categoryName: "INTP" },
    { categoryId: 8, categoryName: "INFP" },
    { categoryId: 9, categoryName: "ESTP" },
    { categoryId: 10, categoryName: "ESFP" },
    { categoryId: 11, categoryName: "ENTP" },
    { categoryId: 12, categoryName: "ENFP" },
    { categoryId: 13, categoryName: "ESTJ" },
    { categoryId: 14, categoryName: "ESFJ" },
    { categoryId: 15, categoryName: "ENTJ" },
    { categoryId: 16, categoryName: "ENFJ" },

  ];

export const mbtiTypes:MBTI[] = [
  {
    "mbtiId": 1,
    "mbtiName": "ISTJ"
  },
  {
    "mbtiId": 2,
    "mbtiName": "ISFJ"
  },
  {
    "mbtiId": 3,
    "mbtiName": "INFJ"
  },
  {
    "mbtiId": 4,
    "mbtiName": "INTJ"
  },
  {
    "mbtiId": 5,
    "mbtiName": "ISTP"
  },
  {
    "mbtiId": 6,
    "mbtiName": "ISFP"
  },
  {
    "mbtiId": 7,
    "mbtiName": "INFP"
  },
  {
    "mbtiId": 8,
    "mbtiName": "INTP"
  },
  {
    "mbtiId": 9,
    "mbtiName": "ESTP"
  },
  {
    "mbtiId": 10,
    "mbtiName": "ESFP"
  },
  {
    "mbtiId": 11,
    "mbtiName": "ENFP"
  },
  {
    "mbtiId": 12,
    "mbtiName": "ENTP"
  },
  {
    "mbtiId": 13,
    "mbtiName": "ESTJ"
  },
  {
    "mbtiId": 14,
    "mbtiName": "ESFJ"
  },
  {
    "mbtiId": 15,
    "mbtiName": "ENFJ"
  },
  {
    "mbtiId": 16,
    "mbtiName": "ENTJ"
  }
]