export interface RawItem {
  description: string;
  quantity: number;
  unit?: string;
}

export interface AggregatedItem {
  id: string;
  description: string;
  totalQuantity: number;
  unit: string;
  occurrenceCount: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  MAPPING = 'MAPPING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ExcelData {
  headers: string[];
  rows: any[]; // Array of objects keyed by header
  fileName: string;
}

export interface ColumnMapping {
  descriptionCol: string;
  quantityCol: string;
  unitCol: string;
}