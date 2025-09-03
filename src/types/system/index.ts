export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  temperature: number;
}