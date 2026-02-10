import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CheckCircle2, ListTodo } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskLog } from './types';
import { getTasks, updateTask, deleteTask, addLog, getAllLogs } from './services/db';
import { TaskItem } from './components/TaskItem';
import { TrackerItem } from './components/TrackerItem';
import { AddTaskModal } from './components/AddTaskModal';
import { TrackerHistoryModal } from './components/TrackerHistoryModal';
import { Button } from './components/ui/Button';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastLogMap, setLastLogMap] = useState<Record<string, string>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Load all tasks
      const allTasks = await getTasks();
      setTasks(allTasks);

      // Load all logs to compute "last log" for trackers
      // In a production app with huge data, we would use an index cursor 'prev' on DB
      const allLogs = await getAllLogs();
      const map: Record<string, string> = {};
      
      allLogs.forEach(log => {
        if (!map[log.taskId] || new Date(log.timestamp) > new Date(map[log.taskId])) {
          map[log.taskId] = log.timestamp;
        }
      });
      setLastLogMap(map);

    } catch (error) {
      console.error("Failed to load data", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleCompleteTask = async (task: Task) => {
    const updated = { ...task, status: 'done' as const, doneAt: new Date().toISOString() };
    await updateTask(updated);
    await loadData();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    await loadData();
  };

  const handleQuickLog = async (tracker: Task, note: string = '') => {
    const newLog: TaskLog = {
      id: uuidv4(),
      taskId: tracker.id,
      timestamp: new Date().toISOString(),
      note: note.trim()
    };
    await addLog(newLog);
    await loadData();
  };

  // Derived state
  const oneOffTasks = tasks.filter(t => t.type === 'one_off' && t.status === 'open');
  const trackers = tasks.filter(t => t.type === 'tracker');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <CheckCircle2 size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">TrackMaster</h1>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            Adicionar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: One-off Tasks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800">Tarefas Pendentes</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {oneOffTasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {oneOffTasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-400">Nenhuma tarefa pendente. Você está livre!</p>
                </div>
              ) : (
                oneOffTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onComplete={handleCompleteTask} 
                    onDelete={handleDeleteTask} 
                  />
                ))
              )}
            </div>
          </section>

          {/* Right Column: Trackers */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-800">Tarefas ativas</h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {trackers.length}
              </span>
            </div>

            <div className="space-y-3">
              {trackers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-400">Nenhum tracker criado.</p>
                </div>
              ) : (
                trackers.map(tracker => (
                  <TrackerItem 
                    key={tracker.id}
                    tracker={tracker}
                    lastLogDate={lastLogMap[tracker.id] || null}
                    onLogNow={handleQuickLog}
                    onOpenHistory={setSelectedTracker}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
             {trackers.length > 0 && (
                 <p className="text-center text-xs text-gray-400 mt-4">
                    Dica: clique duas vezes em um card para abrir o histórico rapidamente.
                </p>
            )}
          </section>

        </div>
      </main>

      {/* Modals */}
      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onTaskAdded={loadData} 
      />

      <TrackerHistoryModal 
        tracker={selectedTracker}
        onClose={() => setSelectedTracker(null)}
        onLogAdded={loadData}
      />
    </div>
  );
}

export default App;