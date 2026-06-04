export interface Genre {
  id: number;
  name: string;
}

export type ContentType = 'movie' | 'tv';

export const GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 9648, name: 'Mystery' },
  { id: 99, name: 'Documentary' },
  { id: 14, name: 'Fantasy' },
  { id: 80, name: 'Crime' },
];

export const IMDB_RATINGS = ['Any rating', '6.0+', '7.0+', '7.5+', '8.0+', '9.0+'];
export const AGE_RATINGS = ['Any', 'G', 'PG', 'PG-13', 'R', '18+'];

export const RELEASE_ERAS = ['All', 'Classic', '90s', '2000s', 'Recent'] as const;
export type ReleaseEra = (typeof RELEASE_ERAS)[number];

/**
 * Maps a release era to a TMDB discover date window (YYYY-MM-DD strings).
 * "Recent" is the last ~10 years; "Classic" is everything pre-1980.
 */
export function mapEraToDateRange(era: ReleaseEra): { gte?: string; lte?: string } {
  switch (era) {
    case 'Classic':
      return { lte: '1979-12-31' };
    case '90s':
      return { gte: '1990-01-01', lte: '1999-12-31' };
    case '2000s':
      return { gte: '2000-01-01', lte: '2009-12-31' };
    case 'Recent': {
      const year = new Date().getFullYear() - 10;
      return { gte: `${year}-01-01` };
    }
    case 'All':
    default:
      return {};
  }
}

export function mapImdbToMinVoteAverage(value: string): number | undefined {
  if (value === 'Any rating') return undefined;
  const parsed = Number(value.replace('+', ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mapAgeToCertification(value: string): string | undefined {
  if (value === 'Any') return undefined;
  if (value === '18+') return 'R';
  return value;
}
