import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, format } from 'date-fns';
import { Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Task, TaskLog } from '../types';
import { getLogs, addLog, deleteLog, updateLog } from '../services/db';
import { formatTime, formatDateHeader } from '../utils/dateUtils';

interface TrackerHistoryModalProps {
  tracker: Task | null;
  onClose: () => void;
  onLogAdded: () => void;
}

export const TrackerHistoryModal: React.FC<TrackerHistoryModalProps> = ({ 
  tracker, 
  onClose, 
  onLogAdded 
}) => {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [newLogNote, setNewLogNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  // Fetch logs when tracker opens
  const fetchLogs = useCallback(async () => {
    if (!tracker) return;
    setIsLoading(true);
    try {
      const fetchedLogs = await getLogs(tracker.id);
      // Sort desc
      fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(fetchedLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [tracker]);

  useEffect(() => {
    if (tracker) {
      fetchLogs();
      setNewLogNote('');
      setSelectedLogId(null);
      setEditingLogId(null);
    }
  }, [tracker, fetchLogs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!tracker) return;
      
      // Delete selected
      if (selectedLogId && !editingLogId) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          if (window.confirm('Excluir o registro selecionado?')) {
            await handleDeleteLog(selectedLogId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLogId, editingLogId, tracker]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tracker) return;

    const newLog: TaskLog = {
      id: uuidv4(),
      taskId: tracker.id,
      timestamp: new Date().toISOString(),
      note: newLogNote.trim(),
    };

    await addLog(newLog);
    setNewLogNote('');
    await fetchLogs();
    onLogAdded(); // Refresh parent stats
  };

  const handleDeleteLog = async (id: string) => {
    await deleteLog(id);
    if (selectedLogId === id) setSelectedLogId(null);
    await fetchLogs();
    onLogAdded();
  };

  const startEditing = (log: TaskLog) => {
    setEditingLogId(log.id);
    setEditNote(log.note);
  };

  const saveEdit = async () => {
    if (!editingLogId || !tracker) return;
    const log = logs.find(l => l.id === editingLogId);
    if (!log) return;

    const updatedLog = { ...log, note: editNote.trim() };
    await updateLog(updatedLog);
    setEditingLogId(null);
    await fetchLogs();
  };

  // Group logs by day
  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: TaskLog[] } = {};
    logs.forEach(log => {
      const dateKey = format(parseISO(log.timestamp), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return Object.entries(groups).map(([date, logs]) => ({ date, logs }));
  }, [logs]);

  return (
    <Modal 
      isOpen={!!tracker} 
      onClose={onClose} 
      title={tracker ? `Histórico: ${tracker.title}` : ''}
      width="max-w-2xl"
    >
      <div className="flex flex-col h-[60vh] sm:h-[500px]">
        {/* Add Log Section */}
        <form onSubmit={handleAddLog} className="flex gap-2 p-1 bg-gray-50 rounded-lg border border-gray-200 mb-6 sticky top-0 z-10">
          <Input 
            value={newLogNote} 
            onChange={(e) => setNewLogNote(e.target.value)}
            placeholder="Adicionar nota (opcional)..."
            className="border-none shadow-none focus:ring-0 bg-transparent"
          />
          <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 my-1 mr-1">
            Registrar Agora
          </Button>
        </form>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Carregando histórico...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 italic">
              Nenhum registro encontrado. Comece a trackear agora!
            </div>
          ) : (
            groupedLogs.map(group => (
              <div key={group.date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-indigo-500" />
                  <h4 className="text-xs font-semibold text-indigo-900 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                    {formatDateHeader(group.logs[0].timestamp)}
                  </h4>
                </div>
                <ul className="space-y-2 pl-2 border-l-2 border-indigo-50 ml-1.5">
                  {group.logs.map(log => (
                    <li 
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`
                        relative group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md transition-all border
                        ${selectedLogId === log.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm'}
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="font-mono text-sm text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                          {formatTime(log.timestamp)}
                        </span>
                        
                        {editingLogId === log.id ? (
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="text" 
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') setEditingLogId(null);
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-800 truncate">
                            {log.note || <span className="text-gray-300 italic">Sem nota</span>}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-2 sm:mt-0 sm:ml-4 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingLogId === log.id ? (
                           <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-50" onClick={saveEdit}>
                              <Check size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:bg-gray-100" onClick={() => setEditingLogId(null)}>
                              <X size={14} />
                            </Button>
                           </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => startEditing(log)} title="Editar nota">
                              <Edit2 size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteLog(log.id)} title="Excluir">
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
        <div className="pt-4 text-xs text-gray-400 text-center border-t border-gray-100 mt-2">
          Dica: Pressione <strong>Delete</strong> para excluir um item selecionado.
        </div>
      </div>
    </Modal>
  );
};