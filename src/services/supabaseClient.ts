/**
 * Supabase Data Source Provider Boundaries
 */
export interface SupabaseService {
  rooms: {
    create: (payload: any) => Promise<any>;
    subscribe: (code: string, callback: (payload: any) => void) => () => void;
    update: (code: string, updates: any) => Promise<any>;
  };
  swipes: {
    record: (payload: any) => Promise<any>;
    onMatch: (callback: (match: any) => void) => () => void;
  };
}

// Actual client export (stub)
export const supabaseClient = {} as SupabaseService;
