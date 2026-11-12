import type { Page } from '@playwright/test';

export interface ImageComparison {
  changedPercent: number
  seriesInk: { color: string, reference: number, actual: number } | null
  comparison: string
  heatmap: string
}

export function compareImages(page: Page, reference: string | URL, actual: string | URL, seriesColor?: string | null): Promise<ImageComparison>;
