
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Room, User } from '@/types/chat';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: Omit<Room, 'id' | 'createdAt'>) => void;
  currentUser: User;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  currentUser,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateRoom({
      name: name.trim(),
      description: description.trim() || '',
      type,
      participants: [currentUser],
      createdBy: currentUser.id,
      isArchived: false,
    });

    setName('');
    setDescription('');
    setType('public');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Создать комнату</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="room-name" className="text-slate-300">
              Название комнаты *
            </Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название комнаты"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <Label htmlFor="room-description" className="text-slate-300">
              Описание
            </Label>
            <Textarea
              id="room-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание комнаты"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-slate-300">Тип комнаты</Label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="public"
                  checked={type === 'public'}
                  onChange={(e) => setType(e.target.value as 'public' | 'private')}
                  className="text-blue-500"
                />
                <span className="text-slate-300">Публичная</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="private"
                  checked={type === 'private'}
                  onChange={(e) => setType(e.target.value as 'public' | 'private')}
                  className="text-blue-500"
                />
                <span className="text-slate-300">Приватная</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Создать
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};