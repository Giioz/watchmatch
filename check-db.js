const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.from('room_movies').insert([{
    room_id: '00000000-0000-0000-0000-000000000000',
    tmdb_id: 1,
    position: 1,
    media_type: 'movie',
    title: 'Test',
    genre_ids: [28]
  }]);
  console.log("Error:", error);
}
check();
