export interface TrainSchedule {
  id: string;
  trainNo: string;
  destination: string;
  time: string;
  platform: string;
  status: "On Time" | "Delayed 5m" | "Delayed 15m" | "Arriving" | "Boarding" | "Departed";
  type: "Express" | "Rapid" | "Commuter" | "Shinkansen";
  lineColor: string;
}

export interface FoodItem {
  id: string;
  name: string;
  nameEn?: string;
  price: string;
  category: "all" | "morning" | "afternoon" | "evening" | "makanan_berat" | "snack_dessert" | "minuman";
  rating: number;
  description: string;
  descriptionEn?: string;
  prepTime: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  isFallback?: boolean;
}

export interface CarriagePathNode {
  id: string;
  label: string;
  x: number;
  y: number;
  active: boolean;
}
