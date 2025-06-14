
export interface BloomReport {
  id: number;
  location: {
    lat: number;
    lng: number;
  };
  reporterName: string;
  reporterPhoto: string;
  postDate: string;
  likes: number;
  images: string[];
  description: string;
  flowerTypes: string[];
  wazeUrl?: string;
  intensity: number; // 0-1 for heatmap calculation
}
