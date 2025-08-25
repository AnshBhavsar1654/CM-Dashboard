export type EventData = {
  id: number;
  eventName: string;
  date: string;
  eventDateMs: number;
  type: string;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  tags: string[];
  distanceTravelled: number;
  department: string;
  imgLink?: string;
};
