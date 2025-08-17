import React, { useState } from 'react';
import { Dumbbell, BarChart3, Plus, List } from 'lucide-react';
import { WorkoutForm } from './components/WorkoutForm';
import { WorkoutList } from './components/WorkoutList';
import { Stats } from './components/Stats';

type TabType = 'add' | 'list' | 'stats';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('add');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWorkoutAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: 'add' as TabType, label: 'Add Workout', icon: Plus },
    { id: 'list' as TabType, label: 'Workouts', icon: List },
    { id: 'stats' as TabType, label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="flex items-center gap-3 py-4">
            <Dumbbell size={32} className="text-primary" />
            <h1 className="text-2xl font-bold">Powerlifting</h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container">
          <div className="flex space-x-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container py-6">
        {activeTab === 'add' && (
          <WorkoutForm onWorkoutAdded={handleWorkoutAdded} />
        )}
        
        {activeTab === 'list' && (
          <WorkoutList refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === 'stats' && (
          <Stats refreshTrigger={refreshTrigger} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container py-4">
          <div className="text-center text-muted">
            <p>Powerlifting Workout Tracker - Track your 5-day split progress</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
