# Powerlifting - Workout Tracker

A modern web application to track your 5-day workout split (pull-push-legs-off-upper-lower-off) with detailed exercise logging, set tracking, and progress statistics.

## Features

- **5-Day Split Tracking**: Support for pull, push, legs, upper, lower, and off days
- **Exercise Management**: Add multiple exercises per workout
- **Set Tracking**: Log reps and weight (kg) for each set
- **Total KG Calculation**: Automatic calculation of total weight lifted per workout
- **Progress Statistics**: View your progress over time with detailed analytics
- **Modern UI**: Clean, responsive design with intuitive navigation
- **Real-time Updates**: Instant updates when adding or deleting workouts

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Custom CSS with modern design system
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd powerlifting
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to Settings > API
4. Copy your Project URL and anon/public key

### 4. Create Database Tables

Run the following SQL in your Supabase SQL editor:

```sql
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
```

### 5. Configure Environment Variables

1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Start the Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage

### Adding a Workout

1. Navigate to the "Add Workout" tab
2. Select the date and day type (pull, push, legs, upper, lower, or off)
3. Add exercises by clicking "Add Exercise"
4. For each exercise, add sets with reps and weight
5. The total KG will be calculated automatically
6. Click "Add Workout" to save

### Viewing Workouts

1. Go to the "Workouts" tab to see all your logged workouts
2. Workouts are displayed in chronological order
3. Each workout shows the date, day type, total KG, and all exercises with sets
4. You can delete workouts using the trash icon

### Checking Statistics

1. Visit the "Stats" tab to view your progress
2. See total workouts, total KG lifted, and average KG per workout
3. View this week's progress and compare with previous periods
4. Check your workout split breakdown

## Project Structure

```
src/
├── components/
│   ├── WorkoutForm.tsx    # Form for adding new workouts
│   ├── WorkoutList.tsx    # Display list of all workouts
│   └── Stats.tsx         # Statistics and progress tracking
├── lib/
│   └── supabase.ts       # Supabase client and type definitions
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
└── index.css             # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
