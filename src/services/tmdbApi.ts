import {
  TMDBDiscoverResponse,
  TMDBGenreResponse,
} from '@/types/movie';

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// ბაზური დამხმარე ფუნქცია
async function fetchFromTMDB<T>(endpoint: string, params: string = ''): Promise<T | null> {
  try {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error("TMDB Fetch Failed:", error);
    return null;
  }
}

export const movieService = {
  /**
   * ფილმების ან სერიალების წამოღება ფილტრების მიხედვით
   * @param type 'movie' ან 'tv'
   * @param genreIds ჟანრების აიდების მასივი (მაგ: [28, 12])
   * @param page გვერდის ნომერი უსასრულო სქროლისთვის
   */
  discoverMedia: async (
    type: 'movie' | 'tv' = 'movie',
    genreIds: number[] = [],
    page: number = 1,
    options: {
      minVoteAverage?: number;
      certification?: string;
      certificationCountry?: string;
      region?: string;
      releaseDateGte?: string;
      releaseDateLte?: string;
    } = {},
  ): Promise<TMDBDiscoverResponse | null> => {
    // თუ ჟანრები არჩეულია, გადავაქციოთ მძიმით გამოყოფილ სტრინგად (მაგ: "28,12")
    const genreParams = genreIds.length > 0 ? `&with_genres=${genreIds.join(',')}` : '';
    const pageParam = `&page=${page}`;
    const voteAverageParam =
      typeof options.minVoteAverage === 'number' ? `&vote_average.gte=${options.minVoteAverage}` : '';
    const regionParam = options.region ? `&region=${options.region}` : '';
    const certificationCountryParam = options.certificationCountry
      ? `&certification_country=${options.certificationCountry}`
      : '';
    const certificationParam =
      type === 'movie' && options.certification ? `&certification=${encodeURIComponent(options.certification)}` : '';

    // Release era window — different date fields for movies vs TV.
    const dateGteField = type === 'tv' ? 'first_air_date.gte' : 'primary_release_date.gte';
    const dateLteField = type === 'tv' ? 'first_air_date.lte' : 'primary_release_date.lte';
    const releaseGteParam = options.releaseDateGte ? `&${dateGteField}=${options.releaseDateGte}` : '';
    const releaseLteParam = options.releaseDateLte ? `&${dateLteField}=${options.releaseDateLte}` : '';

    // TMDb-ზე ფილმებს და სერიალებს სხვადასხვა discover ენდფოინთი აქვს
    return await fetchFromTMDB<TMDBDiscoverResponse>(
      `/discover/${type}`,
      `${genreParams}${pageParam}${voteAverageParam}${regionParam}${certificationCountryParam}${certificationParam}${releaseGteParam}${releaseLteParam}&sort_by=popularity.desc`,
    );
  },

  /**
   * ჟანრების სიის წამოღება (ID-ების და სახელების შესაბამისობა)
   * ეს დაგვჭირდება Room Settings-ის ეკრანზე, რომ იუზერმა ჟანრები აირჩიოს
   */
  getGenres: async (type: 'movie' | 'tv' = 'movie'): Promise<TMDBGenreResponse | null> => {
    return await fetchFromTMDB<TMDBGenreResponse>(`/genre/${type}/list`);
  }
};
