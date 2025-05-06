
import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  type: 'normal' | 'fast' | 'boss';
  speed: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
}

const AlastorGame: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(30);
  const [level, setLevel] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [reloading, setReloading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lastShot, setLastShot] = useState(0);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const enemySpawnRef = useRef<number | null>(null);
  
  // Game constants
  const FIRE_RATE = 200; // ms between shots
  const RELOAD_TIME = 2000; // 2 seconds to reload
  const PLAYER_POSITION = { x: 50, y: 85 }; // % from the bottom center
  
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setHealth(100);
    setAmmo(30);
    setLevel(1);
    setEnemies([]);
    setBullets([]);
    setGameOver(false);
    
    // Start game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    // Start enemy spawner
    spawnEnemies();
  };
  
  const spawnEnemies = () => {
    if (enemySpawnRef.current) clearTimeout(enemySpawnRef.current);
    
    const spawnRate = Math.max(2000 - (level * 200), 500); // Decreases spawn time as level increases
    
    enemySpawnRef.current = window.setTimeout(() => {
      if (!gameOver && gameStarted) {
        const newEnemy: Enemy = {
          id: Date.now(),
          x: Math.random() * 80 + 10, // Random position between 10% and 90%
          y: 0, // Start at the top
          health: Math.random() > 0.8 ? 3 : 1, // 20% chance for stronger enemy
          type: Math.random() > 0.95 ? 'boss' : Math.random() > 0.7 ? 'fast' : 'normal',
          speed: Math.random() * 0.5 + 0.2 + (level * 0.05),
        };
        
        setEnemies(prev => [...prev, newEnemy]);
        spawnEnemies(); // Schedule next spawn
      }
    }, spawnRate);
  };
  
  const gameLoop = () => {
    if (!gameOver && gameStarted) {
      // Move enemies
      setEnemies(prev => {
        const updated = prev.map(enemy => ({
          ...enemy,
          y: enemy.y + enemy.speed,
        })).filter(enemy => {
          // Remove enemies that reached the bottom and decrease health
          if (enemy.y > 95) {
            setHealth(h => Math.max(0, h - (enemy.type === 'boss' ? 20 : 10)));
            return false;
          }
          return true;
        });
        
        return updated;
      });
      
      // Move bullets
      setBullets(prev => {
        return prev.map(bullet => ({
          ...bullet,
          y: bullet.y - 2.5,
        })).filter(bullet => bullet.y > 0);
      });
      
      // Check for collisions
      setEnemies(prev => {
        const updatedEnemies = [...prev];
        
        bullets.forEach(bullet => {
          const bulletHit = { x: bullet.x, y: bullet.y, radius: 1 };
          
          updatedEnemies.forEach(enemy => {
            const enemyHit = { x: enemy.x, y: enemy.y, radius: enemy.type === 'boss' ? 4 : 2.5 };
            
            // Simple collision detection
            const dx = bulletHit.x - enemyHit.x;
            const dy = bulletHit.y - enemyHit.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bulletHit.radius + enemyHit.radius) {
              enemy.health -= 1;
              
              // Remove bullet on hit
              setBullets(prev => prev.filter(b => b.id !== bullet.id));
              
              // If enemy dies
              if (enemy.health <= 0) {
                // Increase score based on enemy type
                setScore(prev => prev + (enemy.type === 'boss' ? 50 : enemy.type === 'fast' ? 20 : 10));
                
                // Level up every 200 points
                if ((score + (enemy.type === 'boss' ? 50 : enemy.type === 'fast' ? 20 : 10)) / 200 > level) {
                  setLevel(prev => prev + 1);
                }
                
                // Remove enemy
                updatedEnemies.splice(updatedEnemies.indexOf(enemy), 1);
              }
            }
          });
        });
        
        return updatedEnemies.filter(enemy => enemy.health > 0);
      });
      
      // Check if game over
      if (health <= 0) {
        setGameOver(true);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        if (enemySpawnRef.current) clearTimeout(enemySpawnRef.current);
        return;
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  const handleShoot = (e: React.MouseEvent) => {
    if (!gameStarted || gameOver || reloading || ammo <= 0) return;
    
    const now = Date.now();
    if (now - lastShot < FIRE_RATE) return; // Rate limit shooting
    
    setLastShot(now);
    
    // Get mouse position relative to game area
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Calculate angle
      const dx = x - PLAYER_POSITION.x;
      const dy = y - PLAYER_POSITION.y;
      const angle = Math.atan2(dy, dx);
      
      // Create new bullet
      const newBullet: Bullet = {
        id: Date.now(),
        x: PLAYER_POSITION.x,
        y: PLAYER_POSITION.y,
        angle,
        speed: 5,
      };
      
      setBullets(prev => [...prev, newBullet]);
      setAmmo(prev => prev - 1);
    }
  };
  
  const handleReload = () => {
    if (reloading || ammo === 30) return;
    
    setReloading(true);
    setTimeout(() => {
      setAmmo(30);
      setReloading(false);
    }, RELOAD_TIME);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (enemySpawnRef.current) clearTimeout(enemySpawnRef.current);
    };
  }, []);
  
  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-0">
        <div 
          ref={gameAreaRef}
          className="relative w-full h-[600px] bg-gradient-to-b from-purple-900 to-black overflow-hidden cursor-crosshair"
          onClick={handleShoot}
          onMouseMove={handleMouseMove}
        >
          {/* Game UI */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
            <div className="bg-black/70 p-2 rounded text-white">
              <div className="flex items-center gap-2">
                <Icon name="Target" size={16} />
                <span>Счет: {score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Gauge" size={16} />
                <span>Уровень: {level}</span>
              </div>
            </div>
            
            <div className="bg-black/70 p-2 rounded text-white">
              <div className="flex items-center gap-2">
                <Icon name="Heart" className="text-red-500" size={16} />
                <Progress value={health} className="w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Bullet" size={16} />
                <span className={ammo < 10 ? "text-red-500" : ""}>{ammo} / 30</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 py-0 px-2 ml-2"
                  onClick={handleReload}
                  disabled={reloading || ammo === 30}
                >
                  {reloading ? "..." : "R"}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Player character */}
          <div 
            className="absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ 
              left: `${PLAYER_POSITION.x}%`, 
              top: `${PLAYER_POSITION.y}%`,
              transform: `rotate(${Math.atan2(
                mousePosition.y - PLAYER_POSITION.y,
                mousePosition.x - PLAYER_POSITION.x
              ) * 180 / Math.PI}deg)` 
            }}
          >
            <div className="absolute w-10 h-3 bg-gray-800 rounded top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-6 h-6 bg-red-600 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-800"></div>
          </div>
          
          {/* Enemies */}
          {enemies.map(enemy => (
            <div 
              key={enemy.id} 
              className={`absolute rounded-full ${
                enemy.type === 'boss' 
                  ? 'w-16 h-16 bg-red-700' 
                  : enemy.type === 'fast' 
                    ? 'w-8 h-8 bg-yellow-500' 
                    : 'w-10 h-10 bg-blue-500'
              }`}
              style={{ 
                left: `${enemy.x}%`, 
                top: `${enemy.y}%`, 
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="absolute inset-2 bg-black/20 rounded-full"></div>
              {enemy.type === 'boss' && (
                <div className="absolute inset-4 bg-black/40 rounded-full flex items-center justify-center text-white font-bold">
                  {enemy.health}
                </div>
              )}
            </div>
          ))}
          
          {/* Bullets */}
          {bullets.map(bullet => (
            <div 
              key={bullet.id} 
              className="absolute w-2 h-2 bg-yellow-300 rounded-full shadow-lg"
              style={{ 
                left: `${bullet.x}%`, 
                top: `${bullet.y}%`, 
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 5px rgba(255, 255, 0, 0.8)'
              }}
            />
          ))}
          
          {/* Start screen */}
          {!gameStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <h1 className="text-4xl font-bold text-red-500 mb-6">ALASTOR</h1>
              <p className="text-white mb-8 max-w-md text-center">Сразитесь с демоническими силами и помогите Аластору защитить свою территорию от вторжения</p>
              <Button onClick={startGame} size="lg">
                <Icon name="Play" className="mr-2" />
                Начать игру
              </Button>
            </div>
          )}
          
          {/* Game over screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <h1 className="text-4xl font-bold text-red-500 mb-6">ИГРА ОКОНЧЕНА</h1>
              <p className="text-white mb-4">Ваш счет: {score}</p>
              <p className="text-white mb-8">Достигнутый уровень: {level}</p>
              <Button onClick={startGame} size="lg" variant="destructive">
                <Icon name="RefreshCw" className="mr-2" />
                Играть снова
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlastorGame;
