import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trash2, Calendar, TrendingUp } from 'lucide-react';
import { supabase, WorkoutWithExercises } from '../lib/supabase';

interface WorkoutListProps {
  refreshTrigger: number;
}

export const WorkoutList: React.FC<WorkoutListProps> = ({ refreshTrigger }) => {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      
      // Fetch workouts with exercises and sets
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

  const deleteWorkout = async (workoutId: string) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;

    try {
      // Delete sets first (due to foreign key constraints)
      const { error: setsError } = await supabase
        .from('sets')
        .delete()
        .in('exercise_id', 
          workouts
            .find(w => w.id === workoutId)
            ?.exercises.map(e => e.id) || []
        );

      if (setsError) throw setsError;

      // Delete exercises
      const { error: exercisesError } = await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', workoutId);

      if (exercisesError) throw exercisesError;

      // Delete workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (workoutError) throw workoutError;

      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Error deleting workout. Please try again.');
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [refreshTrigger]);

  const getDayTypeColor = (dayType: string) => {
    const colors = {
      pull: 'bg-blue-100 text-blue-800',
      push: 'bg-red-100 text-red-800',
      legs: 'bg-green-100 text-green-800',
      upper: 'bg-purple-100 text-purple-800',
      lower: 'bg-orange-100 text-orange-800',
      off: 'bg-gray-100 text-gray-800'
    };
    return colors[dayType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="text-lg">Loading workouts...</div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="card text-center">
        <div className="text-lg text-muted">No workouts found. Add your first workout!</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {workouts.map((workout) => (
        <div key={workout.id} className="card">
          <div className="flex-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-muted" />
                <span className="text-lg font-semibold">
                  {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <span className={`badge ${getDayTypeColor(workout.day_type)}`}>
                {workout.day_type.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-success" />
                <span className="text-lg font-bold text-success">
                  {workout.total_kg} kg
                </span>
              </div>
              <button
                onClick={() => deleteWorkout(workout.id)}
                className="btn btn-danger"
                style={{ padding: '8px 12px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {workout.exercises.length > 0 && (
            <div className="space-y-4">
              {workout.exercises.map((exercise) => (
                <div key={exercise.id} className="border-l-4 border-primary pl-4">
                  <h4 className="text-lg font-semibold mb-2">{exercise.name}</h4>
                  {exercise.sets.length > 0 && (
                    <div className="grid grid-3 gap-2">
                      {exercise.sets.map((set, index) => (
                        <div key={set.id} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Set {index + 1}:</span>
                          <span>{set.reps} × {set.weight_kg} kg</span>
                          <span className="text-muted">
                            ({set.reps * set.weight_kg} kg)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
