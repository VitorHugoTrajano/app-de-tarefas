import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { Button } from './ui/Button';

interface TaskItemProps {
  task: Task;
  onComplete: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      onDelete(task.id);
    }
  };

  return (
    <div className="group flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0 mr-4">
        <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">Criado em {new Date(task.createdAt).toLocaleDateString('pt-BR')}</p>
      </div>
      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
          title="Excluir tarefa"
        >
          <Trash2 size={18} />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onComplete(task)}
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
        >
          <Check size={16} className="mr-1.5" />
          Concluir
        </Button>
      </div>
    </div>
  );
};