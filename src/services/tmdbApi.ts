const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// ბაზური დამხმარე ფუნქცია
async function fetchFromTMDB(endpoint: string, params: string = '') {
  try {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }
    return await response.json();
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
  discoverMedia: async (type: 'movie' | 'tv' = 'movie', genreIds: number[] = [], page: number = 1) => {
    // თუ ჟანრები არჩეულია, გადავაქციოთ მძიმით გამოყოფილ სტრინგად (მაგ: "28,12")
    const genreParams = genreIds.length > 0 ? `&with_genres=${genreIds.join(',')}` : '';
    const pageParam = `&page=${page}`;
    
    // TMDb-ზე ფილმებს და სერიალებს სხვადასხვა discover ენდფოინთი აქვს
    return await fetchFromTMDB(`/discover/${type}`, `${genreParams}${pageParam}&sort_by=popularity.desc`);
  },

  /**
   * ჟანრების სიის წამოღება (ID-ების და სახელების შესაბამისობა)
   * ეს დაგვჭირდება Room Settings-ის ეკრანზე, რომ იუზერმა ჟანრები აირჩიოს
   */
  getGenres: async (type: 'movie' | 'tv' = 'movie') => {
    return await fetchFromTMDB(`/genre/${type}/list`);
  }
};