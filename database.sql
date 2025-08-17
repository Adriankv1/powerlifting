-- Powerlifting Workout Tracker Database Schema
-- Run this in your Supabase SQL editor

-- Create workouts table
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  day_type TEXT NOT NULL CHECK (day_type IN ('pull', 'push', 'legs', 'upper', 'lower', 'off')),
  total_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sets table
CREATE TABLE sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  reps INTEGER NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX idx_sets_exercise_id ON sets(exercise_id);

-- Enable Row Level Security (RLS)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these for authentication later)
CREATE POLICY "Allow public read access to workouts" ON workouts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to workouts" ON workouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to workouts" ON workouts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to workouts" ON workouts FOR DELETE USING (true);

CREATE POLICY "Allow public read access to exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to exercises" ON exercises FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to exercises" ON exercises FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to exercises" ON exercises FOR DELETE USING (true);

CREATE POLICY "Allow public read access to sets" ON sets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to sets" ON sets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to sets" ON sets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to sets" ON sets FOR DELETE USING (true);
