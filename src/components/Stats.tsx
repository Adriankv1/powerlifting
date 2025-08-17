import React, { useState, useEffect } from 'react';
import { BarChart3, Target, Calendar, TrendingUp } from 'lucide-react';
import { supabase, WorkoutWithExercises } from '../lib/supabase';
import { subDays, startOfWeek, endOfWeek } from 'date-fns';

interface StatsProps {
  refreshTrigger: number;
}

export const Stats: React.FC<StatsProps> = ({ refreshTrigger }) => {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (
            *,
            sets (*)
          )
        `)
        .order('date', { ascending: false });

      if (workoutsError) throw workoutsError;

      setWorkouts(workoutsData || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [refreshTrigger]);

  const calculateStats = () => {
    if (workouts.length === 0) return null;

    const totalWorkouts = workouts.length;
    const totalKg = workouts.reduce((sum, workout) => sum + workout.total_kg, 0);
    const avgKgPerWorkout = totalKg / totalWorkouts;

    // This week's stats
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const thisWeekWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });

    const thisWeekKg = thisWeekWorkouts.reduce((sum, workout) => sum + workout.total_kg, 0);

    // Day type breakdown
    const dayTypeStats = workouts.reduce((acc, workout) => {
      acc[workout.day_type] = (acc[workout.day_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent progress (last 7 days vs previous 7 days)
    const last7Days = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= subDays(now, 7);
    });

    const previous7Days = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= subDays(now, 14) && workoutDate < subDays(now, 7);
    });

    const last7DaysKg = last7Days.reduce((sum, workout) => sum + workout.total_kg, 0);
    const previous7DaysKg = previous7Days.reduce((sum, workout) => sum + workout.total_kg, 0);
    const progress = previous7DaysKg > 0 ? ((last7DaysKg - previous7DaysKg) / previous7DaysKg) * 100 : 0;

    return {
      totalWorkouts,
      totalKg,
      avgKgPerWorkout,
      thisWeekKg,
      thisWeekWorkouts: thisWeekWorkouts.length,
      dayTypeStats,
      last7DaysKg,
      previous7DaysKg,
      progress
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="card text-center">
        <div className="text-lg">Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card text-center">
        <div className="text-lg text-muted">No stats available. Add some workouts!</div>
      </div>
    );
  }

  return (
    <div className="grid grid-3 gap-6">
      {/* Total Stats */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 size={24} className="text-primary" />
          <h3 className="text-lg font-semibold">Total Stats</h3>
        </div>
        <div className="space-y-3">
          <div className="flex-between">
            <span className="text-muted">Total Workouts:</span>
            <span className="font-semibold">{stats.totalWorkouts}</span>
          </div>
          <div className="flex-between">
            <span className="text-muted">Total KG Lifted:</span>
            <span className="font-semibold text-success">{stats.totalKg.toLocaleString()} kg</span>
          </div>
          <div className="flex-between">
            <span className="text-muted">Avg KG/Workout:</span>
            <span className="font-semibold">{Math.round(stats.avgKgPerWorkout)} kg</span>
          </div>
        </div>
      </div>

      {/* This Week */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={24} className="text-primary" />
          <h3 className="text-lg font-semibold">This Week</h3>
        </div>
        <div className="space-y-3">
          <div className="flex-between">
            <span className="text-muted">Workouts:</span>
            <span className="font-semibold">{stats.thisWeekWorkouts}</span>
          </div>
          <div className="flex-between">
            <span className="text-muted">KG Lifted:</span>
            <span className="font-semibold text-success">{stats.thisWeekKg.toLocaleString()} kg</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={24} className="text-primary" />
          <h3 className="text-lg font-semibold">Progress</h3>
        </div>
        <div className="space-y-3">
          <div className="flex-between">
            <span className="text-muted">Last 7 days:</span>
            <span className="font-semibold">{stats.last7DaysKg.toLocaleString()} kg</span>
          </div>
          <div className="flex-between">
            <span className="text-muted">Previous 7 days:</span>
            <span className="font-semibold">{stats.previous7DaysKg.toLocaleString()} kg</span>
          </div>
          <div className="flex-between">
            <span className="text-muted">Change:</span>
            <span className={`font-semibold ${stats.progress >= 0 ? 'text-success' : 'text-danger'}`}>
              {stats.progress >= 0 ? '+' : ''}{Math.round(stats.progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Day Type Breakdown */}
      <div className="card col-span-3">
        <div className="flex items-center gap-3 mb-4">
          <Target size={24} className="text-primary" />
          <h3 className="text-lg font-semibold">Workout Split Breakdown</h3>
        </div>
        <div className="grid grid-3 gap-4">
          {Object.entries(stats.dayTypeStats).map(([dayType, count]) => (
            <div key={dayType} className="flex-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium capitalize">{dayType}</span>
              <span className="badge badge-primary">{count} workouts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
