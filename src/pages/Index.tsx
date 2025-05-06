
import React from 'react';
import AlastorGame from '@/components/game/AlastorGame';
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Index = () => {
  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <header className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-5xl font-bold text-red-600 mb-2">ALASTOR</h1>
        <p className="text-gray-400">Демонический шутер в мире тьмы и хаоса</p>
      </header>
      
      <main className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-8">
          <AlastorGame />
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Управление</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Icon name="MousePointer" className="text-red-500" size={20} />
                <span className="text-gray-300">Прицеливание и стрельба</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="w-12 h-8">R</Button>
                <span className="text-gray-300">Перезарядка оружия</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Об игре</h2>
            <p className="text-gray-300 mb-4">
              Alastor - демонический повелитель, защищающий свои владения от вторжения других потусторонних сущностей. 
              Используйте свои сверхъестественные способности, чтобы устранить всех врагов и доказать своё превосходство.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-gray-300">Обычные враги</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-gray-300">Быстрые враги</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-700"></div>
                <span className="text-gray-300">Боссы</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="max-w-4xl mx-auto mt-12 text-center text-gray-600">
        <p>© 2025 Alastor. Демонический шутер.</p>
        <p className="text-xs mt-2">Внимание: это просто демонстрационная игра, созданная для развлечения.</p>
      </footer>
    </div>
  );
};

export default Index;
