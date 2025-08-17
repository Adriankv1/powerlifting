import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WorkoutFormProps {
  onWorkoutAdded: () => void;
}

interface ExerciseForm {
  name: string;
  sets: Array<{
    reps: number;
    weight_kg: number;
  }>;
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onWorkoutAdded }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayType, setDayType] = useState<'pull' | 'push' | 'legs' | 'upper' | 'lower' | 'off'>('pull');
  const [exercises, setExercises] = useState<ExerciseForm[]>([
    { name: '', sets: [{ reps: 0, weight_kg: 0 }] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: 0, weight_kg: 0 }] }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExerciseName = (index: number, name: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = name;
    setExercises(newExercises);
  };

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: 0, weight_kg: 0 });
    setExercises(newExercises);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight_kg', value: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const calculateTotalKg = () => {
    return exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.reps * set.weight_kg);
      }, 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          date,
          day_type: dayType,
          total_kg: calculateTotalKg()
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create exercises and sets
      for (const exercise of exercises) {
        if (exercise.name.trim() && exercise.sets.some(set => set.reps > 0 && set.weight_kg > 0)) {
          const { data: exerciseData, error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              workout_id: workout.id,
              name: exercise.name.trim()
            })
            .select()
            .single();

          if (exerciseError) throw exerciseError;

          // Create sets
          const setsToInsert = exercise.sets
            .filter(set => set.reps > 0 && set.weight_kg > 0)
            .map(set => ({
              exercise_id: exerciseData.id,
              reps: set.reps,
              weight_kg: set.weight_kg
            }));

          if (setsToInsert.length > 0) {
            const { error: setsError } = await supabase
              .from('sets')
              .insert(setsToInsert);

            if (setsError) throw setsError;
          }
        }
      }

      // Reset form
      setExercises([{ name: '', sets: [{ reps: 0, weight_kg: 0 }] }]);
      onWorkoutAdded();
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Error adding workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl mb-4">Add New Workout</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-2 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-4">Day Type</label>
            <select
              value={dayType}
              onChange={(e) => setDayType(e.target.value as any)}
              className="input"
              required
            >
              <option value="pull">Pull</option>
              <option value="push">Push</option>
              <option value="legs">Legs</option>
              <option value="upper">Upper</option>
              <option value="lower">Lower</option>
              <option value="off">Off</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex-between mb-4">
            <h3 className="text-lg">Exercises</h3>
            <button
              type="button"
              onClick={addExercise}
              className="btn btn-secondary"
            >
              <Plus size={16} />
              Add Exercise
            </button>
          </div>

          {exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="card mb-4">
              <div className="flex-between mb-4">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                  className="input"
                  style={{ maxWidth: '300px' }}
                />
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(exerciseIndex)}
                    className="btn btn-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <div className="flex-between mb-2">
                  <h4 className="text-sm font-medium">Sets</h4>
                  <button
                    type="button"
                    onClick={() => addSet(exerciseIndex)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    <Plus size={14} />
                    Add Set
                  </button>
                </div>

                <div className="grid grid-3">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-2">
                      <span className="text-sm font-medium">Set {setIndex + 1}:</span>
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                        className="input"
                        style={{ width: '80px' }}
                        min="0"
                      />
                      <span className="text-sm">×</span>
                      <input
                        type="number"
                        placeholder="Kg"
                        value={set.weight_kg || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight_kg', parseFloat(e.target.value) || 0)}
                        className="input"
                        style={{ width: '80px' }}
                        min="0"
                        step="0.5"
                      />
                      <span className="text-sm">kg</span>
                      {exercise.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-between">
          <div className="text-lg">
            Total KG: <span className="font-bold text-primary">{calculateTotalKg()}</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn"
          >
            {isSubmitting ? 'Adding...' : 'Add Workout'}
          </button>
        </div>
      </form>
    </div>
  );
};
