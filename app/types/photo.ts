export type Photo = {
  id: number;
  src: string;
  title: string;
  description: string;
  category: string[];
  order: number;
  thumbnail?: string;
};
