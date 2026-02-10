import React, { useState } from 'react';
import { Plus, History, Trash2, Activity } from 'lucide-react';
import { Task } from '../types';
import { Button } from './ui/Button';
import { formatRelativeTime } from '../utils/dateUtils';

interface TrackerItemProps {
  tracker: Task;
  lastLogDate: string | null;
  onLogNow: (tracker: Task, note: string) => void;
  onOpenHistory: (tracker: Task) => void;
  onDelete: (id: string) => void;
}

export const TrackerItem: React.FC<TrackerItemProps> = ({ 
  tracker, 
  lastLogDate, 
  onLogNow, 
  onOpenHistory, 
  onDelete 
}) => {
  const [note, setNote] = useState('');
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Excluir este tracker apagará todo o histórico de registros. Continuar?')) {
      onDelete(tracker.id);
    }
  };

  const handleLog = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onLogNow(tracker, note);
    setNote('');
  };

  return (
    <div 
      className="group relative bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onDoubleClick={() => onOpenHistory(tracker)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                <Activity size={18} />
            </div>
            <h3 className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[200px]" title={tracker.title}>
              {tracker.title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
             <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
              title="Excluir tracker"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="my-3">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Adicionar nota (opcional)..."
            className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                handleLog();
              }
            }}
          />
        </div>

        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Último registro</p>
            <p className="text-sm text-gray-800 font-medium">
              {lastLogDate ? formatRelativeTime(lastLogDate) : '—'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onOpenHistory(tracker); }}
              className="hidden sm:flex"
            >
              <History size={16} className="mr-1.5" />
              Histórico
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleLog}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} className="mr-1.5" />
              Registrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};