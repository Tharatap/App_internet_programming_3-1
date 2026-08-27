import { useMemo } from 'react';

import type { BrandPalette } from '@/constants/theme';
import { useBrand } from '@/store/theme-store';

export function useStyles<T>(makeStyles: (brand: BrandPalette) => T): T {
  const brand = useBrand();
  return useMemo(() => makeStyles(brand), [makeStyles, brand]);
}
