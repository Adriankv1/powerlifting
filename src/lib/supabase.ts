import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Workout {
  id: string;
  date: string;
  day_type: 'pull' | 'push' | 'legs' | 'upper' | 'lower' | 'off';
  total_kg: number;
  created_at: string;
}

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  sets: Set[];
  created_at: string;
}

export interface Set {
  id: string;
  exercise_id: string;
  reps: number;
  weight_kg: number;
  created_at: string;
}

export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[];
}
