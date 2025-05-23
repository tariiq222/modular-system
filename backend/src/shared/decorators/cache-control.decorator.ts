import { SetMetadata } from '@nestjs/common';

export const CACHE_CONTROL_KEY = 'cacheControl';

export interface CacheControlOptions {
  maxAge?: number;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  public?: boolean;
  private?: boolean;
}

export const CacheControl = (options: CacheControlOptions) => 
  SetMetadata(CACHE_CONTROL_KEY, options);