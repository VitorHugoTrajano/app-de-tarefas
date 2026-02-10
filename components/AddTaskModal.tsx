import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Task, TaskType } from '../types';
import { addTask } from '../services/db';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('one_off');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const newTask: Task = {
        id: uuidv4(),
        title: title.trim(),
        type,
        status: 'open',
        createdAt: new Date().toISOString(),
        doneAt: null,
      };

      await addTask(newTask);
      onTaskAdded();
      handleClose();
    } catch (error) {
      console.error("Failed to add task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setType('one_off');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Novo Item">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Título" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Ex: Beber água, Ler um livro..."
          autoFocus
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tipo de Item</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label 
              className={`
                relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                ${type === 'one_off' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <input 
                type="radio" 
                name="type" 
                value="one_off" 
                checked={type === 'one_off'} 
                onChange={() => setType('one_off')}
                className="sr-only"
              />
              <div className="text-center">
                <span className="block font-medium text-gray-900">Tarefa</span>
                <span className="block text-xs text-gray-500 mt-1">Item único finalizável</span>
              </div>
            </label>

            <label 
              className={`
                relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                ${type === 'tracker' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <input 
                type="radio" 
                name="type" 
                value="tracker" 
                checked={type === 'tracker'} 
                onChange={() => setType('tracker')}
                className="sr-only"
              />
              <div className="text-center">
                <span className="block font-medium text-gray-900">Tracker</span>
                <span className="block text-xs text-gray-500 mt-1">Registro recorrente</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!title.trim() || isSubmitting}>
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  );
};