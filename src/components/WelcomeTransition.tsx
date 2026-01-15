import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WelcomeTransitionProps {
  userName: string;
  onComplete: () => void;
}

export const WelcomeTransition = ({ userName, onComplete }: WelcomeTransitionProps) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'fadeOut'>('typing');
  
  const welcomeMessage = `WELCOME, ${userName.toUpperCase()}`;
  
  useEffect(() => {
    if (phase === 'typing') {
      if (displayText.length < welcomeMessage.length) {
        const timeout = setTimeout(() => {
          setDisplayText(welcomeMessage.slice(0, displayText.length + 1));
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, hold for a moment
        const holdTimeout = setTimeout(() => setPhase('holding'), 500);
        return () => clearTimeout(holdTimeout);
      }
    }
    
    if (phase === 'holding') {
      const fadeTimeout = setTimeout(() => setPhase('fadeOut'), 1000);
      return () => clearTimeout(fadeTimeout);
    }
    
    if (phase === 'fadeOut') {
      const completeTimeout = setTimeout(onComplete, 800);
      return () => clearTimeout(completeTimeout);
    }
  }, [displayText, phase, welcomeMessage, onComplete]);
  
  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700",
        "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        phase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Main content */}
      <div className="relative z-10 text-center px-8">
        {/* System status line */}
        <div className="mb-8 text-xs tracking-[0.3em] text-blue-400/60 font-mono uppercase">
          System Access Granted • Security Level: Classified
        </div>
        
        {/* Main welcome text */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[0.15em] font-mono">
          <span 
            className="bg-gradient-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)'
            }}
          >
            {displayText}
          </span>
          <span 
            className={cn(
              "inline-block w-[3px] h-[1em] ml-2 bg-blue-400 align-middle transition-opacity",
              showCursor ? 'opacity-100' : 'opacity-0'
            )}
          />
        </h1>
        
        {/* Subtitle */}
        <div 
          className={cn(
            "mt-8 text-sm md:text-base tracking-[0.2em] text-slate-400 font-mono uppercase transition-opacity duration-500",
            displayText.length === welcomeMessage.length ? 'opacity-100' : 'opacity-0'
          )}
        >
          Initializing INGOT Interface...
        </div>
        
        {/* Loading bar */}
        <div 
          className={cn(
            "mt-6 mx-auto w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden transition-opacity duration-500",
            displayText.length === welcomeMessage.length ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-white to-red-500 rounded-full"
            style={{
              animation: 'loading 1.5s ease-in-out forwards',
              width: '0%'
            }}
          />
        </div>
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 text-xs font-mono text-blue-500/40">
        [INGOT v1.0]
      </div>
      <div className="absolute top-4 right-4 text-xs font-mono text-blue-500/40">
        [SECURE CONNECTION]
      </div>
      <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-600">
        Government of Canada • Gouvernement du Canada
      </div>
      <div className="absolute bottom-4 right-4">
        <span className="text-2xl">🍁</span>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
