export type Photo = {
  id: number;
  src: string;
  title: string;
  description: string;
  category: string[];
  order: number; // 表示順序
  thumbnail?: string; // サムネイルURL（オプション）
};
