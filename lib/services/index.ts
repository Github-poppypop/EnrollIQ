/**
 * Barrel re-export for the lib/services/ directory.
 *
 * Import what you need from here, e.g.:
 *   import { listEnrollmentsByInstitutionAndTerm } from '@/lib/services';
 */

export * from './enrollment-service';
export {
  listForecastsByInstitution as listForecasts,
  getForecastById,
  createForecast,
  persistForecast,
  validateForecastMetadata,
} from './forecast-service';
export type {
  ForecastRow,
  CreateForecastInput,
  ForecastInput,
  ForecastMetadata,
  SubForecast,
} from './forecast-service';
export * from './upload-service';

// ── Client-facing page data wrappers ─────────────────────────────────────────
// These hit the Next.js API routes so client components never embed
// hardcoded data and get proper loading / error / empty states.

export type MetricItem = {
  title: string;
  value: string;
  delta: string;
  icon: string;
};

export type DemandCapacityPoint = {
  term: string;
  actual: number;
  forecast: number;
};

export type ScatterPoint = {
  term: string;
  demand: number;
  capacity: number;
};

export type RadarDimension = {
  name: string;
  value: number;
};

export type HeatmapCell = {
  term: string;
  segment: string;
  value: number;
};

export type DonutSegment = {
  name: string;
  value: number;
  color: string;
};

export type PredictionWithBounds = {
  term: string;
  actual: number | null;
  upper: number;
  lower: number;
};

export type DashboardPayload = {
  metrics: MetricItem[];
  demandCapacity: DemandCapacityPoint[];
  scatter: ScatterPoint[];
};

export async function fetchDashboardData(): Promise<DashboardPayload> {
  const res = await fetch('/api/dashboard', {
    next: { revalidate: 60 },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Dashboard fetch failed (${res.status})`);
  }
  return res.json();
}

export type ForecastPoint = {
  term: string;
  lower: number | null;
  actual: number | null;
  upper: number;
};

export type PredictionsPayload = {
  forecast: ForecastPoint[];
  models: string[];
};

export async function fetchPredictionsData(): Promise<PredictionsPayload> {
  const res = await fetch('/api/insights/predictions', {
    next: { revalidate: 60 },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Predictions fetch failed (${res.status})`);
  }
  return res.json();
}

export type TrendPoint = {
  term: string;
  freshman: number;
  transfer: number;
  grad: number;
};

export type TrendsPayload = {
  trends: TrendPoint[];
};

export async function fetchTrendsData(): Promise<TrendsPayload> {
  const res = await fetch('/api/insights/trends', {
    next: { revalidate: 60 },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Trends fetch failed (${res.status})`);
  }
  return res.json();
}

export type UploadResponse = {
  success: boolean;
  message: string;
  file: {
    name: string;
    size: number;
    type: string;
    lastModified: string;
  };
};

export async function submitUpload(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Upload failed (${res.status})`);
  }

  return res.json();
}

export async function fetchScatterData(): Promise<ScatterPoint[]> {
  const res = await fetch('/api/dashboard', {
    next: { revalidate: 60 },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Scatter data fetch failed (${res.status})`);
  }
  const body = (await res.json()) as { scatter: ScatterPoint[] };
  return body.scatter;
}

export async function fetchRadarData(): Promise<RadarDimension[]> {
  const res = await fetch('/api/insights/radar', {
    next: { revalidate: 60 },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Radar data fetch failed (${res.status})`);
  }
  return res.json();
}

export async function fetchHeatmapData(): Promise<HeatmapCell[]> {
  const res = await fetch('/api/insights/heatmap', {
    next: { revalidate: 60 },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Heatmap data fetch failed (${res.status})`);
  }
  return res.json();
}
