
import React, { useEffect, useState } from 'react';

interface FireworksAnimationProps {
  isActive: boolean;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
}

const FireworksAnimation: React.FC<FireworksAnimationProps> = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationId, setAnimationId] = useState<number | null>(null);

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];

  const createFirework = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 2 + Math.random() * 3;
      
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        maxLife: 60 + Math.random() * 40
      });
    }

    return newParticles;
  };

  const updateParticles = (currentParticles: Particle[]): Particle[] => {
    return currentParticles
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.1, // gravity
        vx: particle.vx * 0.99, // friction
        life: particle.life + 1
      }))
      .filter(particle => particle.life < particle.maxLife);
  };

  useEffect(() => {
    if (!isActive) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        setAnimationId(null);
      }
      setParticles([]);
      return;
    }

    // Create multiple fireworks at different positions and times
    const fireworksPositions = [
      { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3, delay: 0 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2, delay: 300 },
      { x: window.innerWidth * 0.8, y: window.innerHeight * 0.3, delay: 600 },
      { x: window.innerWidth * 0.3, y: window.innerHeight * 0.4, delay: 900 },
      { x: window.innerWidth * 0.7, y: window.innerHeight * 0.3, delay: 1200 }
    ];

    const timeouts: NodeJS.Timeout[] = [];

    fireworksPositions.forEach(({ x, y, delay }) => {
      const timeout = setTimeout(() => {
        setParticles(prev => [...prev, ...createFirework(x, y)]);
      }, delay);
      timeouts.push(timeout);
    });

    const animate = () => {
      setParticles(prev => {
        const updated = updateParticles(prev);
        if (updated.length === 0 && Date.now() > 2000) {
          onComplete();
          return [];
        }
        return updated;
      });
      
      const id = requestAnimationFrame(animate);
      setAnimationId(id);
    };

    animate();

    // Auto-complete after 3 seconds
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <svg width="100%" height="100%" className="absolute inset-0">
        {particles.map(particle => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={2 + Math.random() * 2}
            fill={particle.color}
            opacity={Math.max(0, 1 - particle.life / particle.maxLife)}
          />
        ))}
      </svg>
      
      {/* Celebration text overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-bounce">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-4 shadow-lg border">
            <h2 className="text-2xl font-bold text-center text-green-600 mb-2">
              🎉 ¡Felicidades! 🎉
            </h2>
            <p className="text-gray-700 text-center">
              ¡Has recibido una oferta de trabajo!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireworksAnimation;
