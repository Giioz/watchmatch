import AsyncStorage from '@react-native-async-storage/async-storage';
import { movieService } from './tmdbApi';
import { roomService } from './roomService';
import { TMDBMediaItem } from '@/types/movie';

const KEYS = {
  WATCHLIST: '@personal_watchlist',
  LIKES: '@personal_likes',
  TODAYS_PICKS: '@todays_picks',
  TODAYS_PICKS_DATE: '@todays_picks_date',
};

export const personalLibraryService = {
  // --- Watchlist ---
  getWatchlist: async (): Promise<TMDBMediaItem[]> => {
    try {
      const data = await AsyncStorage.getItem(KEYS.WATCHLIST);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load watchlist', e);
      return [];
    }
  },

  addToWatchlist: async (movie: TMDBMediaItem): Promise<void> => {
    try {
      const list = await personalLibraryService.getWatchlist();
      if (!list.some(m => m.id === movie.id)) {
        list.push(movie);
        await AsyncStorage.setItem(KEYS.WATCHLIST, JSON.stringify(list));
      }
    } catch (e) {
      console.error('Failed to add to watchlist', e);
    }
  },

  removeFromWatchlist: async (movieId: number): Promise<void> => {
    try {
      const list = await personalLibraryService.getWatchlist();
      const updated = list.filter(m => m.id !== movieId);
      await AsyncStorage.setItem(KEYS.WATCHLIST, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove from watchlist', e);
    }
  },

  isInWatchlist: async (movieId: number): Promise<boolean> => {
    const list = await personalLibraryService.getWatchlist();
    return list.some(m => m.id === movieId);
  },

  // --- Likes ---
  getLikes: async (): Promise<TMDBMediaItem[]> => {
    try {
      const data = await AsyncStorage.getItem(KEYS.LIKES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load likes', e);
      return [];
    }
  },

  addLike: async (movie: TMDBMediaItem): Promise<void> => {
    try {
      const list = await personalLibraryService.getLikes();
      if (!list.some(m => m.id === movie.id)) {
        list.push(movie);
        await AsyncStorage.setItem(KEYS.LIKES, JSON.stringify(list));
      }
    } catch (e) {
      console.error('Failed to add like', e);
    }
  },

  removeLike: async (movieId: number): Promise<void> => {
    try {
      const list = await personalLibraryService.getLikes();
      const updated = list.filter(m => m.id !== movieId);
      await AsyncStorage.setItem(KEYS.LIKES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove like', e);
    }
  },

  isLiked: async (movieId: number): Promise<boolean> => {
    const list = await personalLibraryService.getLikes();
    return list.some(m => m.id === movieId);
  },

  // --- Today's Picks ---
  getTodaysPicks: async (userId: string, forceRefresh = false): Promise<TMDBMediaItem[]> => {
    try {
      if (forceRefresh) {
        const newPicks = await personalLibraryService.generateTodaysPicks(userId);
        await AsyncStorage.setItem(KEYS.TODAYS_PICKS, JSON.stringify(newPicks));
        await AsyncStorage.setItem(KEYS.TODAYS_PICKS_DATE, new Date().getTime().toString());
        return newPicks;
      }

      const cachedPicks = await AsyncStorage.getItem(KEYS.TODAYS_PICKS);
      const cachedDate = await AsyncStorage.getItem(KEYS.TODAYS_PICKS_DATE);
      
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (cachedPicks && cachedDate) {
        const lastUpdated = parseInt(cachedDate, 10);
        if (now - lastUpdated < oneDay) {
          return JSON.parse(cachedPicks);
        }
      }

      // Generate new picks
      const newPicks = await personalLibraryService.generateTodaysPicks(userId);
      await AsyncStorage.setItem(KEYS.TODAYS_PICKS, JSON.stringify(newPicks));
      await AsyncStorage.setItem(KEYS.TODAYS_PICKS_DATE, now.toString());
      return newPicks;
    } catch (e) {
      console.error('Failed to get todays picks', e);
      return [];
    }
  },

  generateTodaysPicks: async (userId: string): Promise<TMDBMediaItem[]> => {
    try {
      // 1. Get Taste DNA (Top Genre)
      let topGenreId: number | null = null;
      try {
        const streakTaste = await roomService.getStreakAndTaste(userId);
        topGenreId = streakTaste.topGenreId;
      } catch (err) {
        console.warn('Failed to fetch streak and taste DNA, using fallback genres', err);
      }
      
      // 2. Get Recent Match Likes
      let matchMovieIds: number[] = [];
      try {
        const recentMatches = await roomService.getRecentMatches(userId);
        matchMovieIds = recentMatches.map(m => m.movie.tmdb_id);
      } catch (err) {
        console.warn('Failed to fetch recent matches', err);
      }

      // 3. Get Personal Likes and Watchlist
      const personalLikes = await personalLibraryService.getLikes();
      const personalWatchlist = await personalLibraryService.getWatchlist();

      // Collect all source IDs for recommendations
      const likedSourceIds = [...matchMovieIds, ...personalLikes.map(m => m.id)];
      const watchlistedIds = personalWatchlist.map(m => m.id);

      let recommendationsPool: TMDBMediaItem[] = [];

      // Query recommendations from TMDB for a random liked movie if available
      if (likedSourceIds.length > 0) {
        const randomSourceId = likedSourceIds[Math.floor(Math.random() * likedSourceIds.length)];
        const recs = await movieService.getRecommendations(randomSourceId);
        if (recs && recs.results) {
          recommendationsPool.push(...recs.results);
        }
      }

      // Query discover media based on top genres
      const genreIds = topGenreId ? [topGenreId] : [28, 35, 18]; // Default to Action, Comedy, Drama if no top genre
      const discoverData = await movieService.discoverMedia('movie', genreIds, 1, { minVoteAverage: 7 });
      if (discoverData && discoverData.results) {
        recommendationsPool.push(...discoverData.results);
      }

      // Filter out movies that the user has already liked or watchlisted
      const allInteractedIds = new Set([
        ...likedSourceIds,
        ...watchlistedIds,
      ]);

      let filteredPool = recommendationsPool.filter(
        movie => movie.id && !allInteractedIds.has(movie.id) && (movie.title || movie.name)
      );

      // Deduplicate by ID
      const uniquePoolMap = new Map<number, TMDBMediaItem>();
      filteredPool.forEach(movie => {
        uniquePoolMap.set(movie.id, movie);
      });
      const uniquePool = Array.from(uniquePoolMap.values());

      // If the pool is too small, fetch popular movies to fill it
      if (uniquePool.length < 5) {
        const popular = await movieService.discoverMedia('movie', [], 1, { minVoteAverage: 6.5 });
        if (popular && popular.results) {
          popular.results.forEach(movie => {
            if (movie.id && !allInteractedIds.has(movie.id) && !uniquePoolMap.has(movie.id)) {
              uniquePool.push(movie);
            }
          });
        }
      }

      // Shuffle the pool
      const shuffled = uniquePool.sort(() => 0.5 - Math.random());

      // Return 3-5 items
      return shuffled.slice(0, 5);
    } catch (e) {
      console.error('Failed to generate todays picks', e);
      return [];
    }
  }
};
