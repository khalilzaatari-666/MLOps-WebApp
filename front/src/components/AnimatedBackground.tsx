import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-background fixed inset-0 -z-10 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Floating circles */}
      <div className="circle-1 absolute w-96 h-96 rounded-full bg-green-300/40 blur-3xl animate-float-slow left-20 top-20"></div>
      <div className="circle-2 absolute w-72 h-72 rounded-full bg-green-500/30 blur-3xl animate-float-medium right-20 top-40"></div>
      <div className="circle-3 absolute w-64 h-64 rounded-full bg-purple-500/30 blur-3xl animate-float-fast bottom-20 left-20"></div>
      <div className="circle-4 absolute w-80 h-80 rounded-full bg-blue-400/30 blur-3xl animate-float-medium -left-20 top-1/2"></div>
      <div className="circle-5 absolute w-60 h-60 rounded-full bg-orange-400/30 blur-3xl animate-float-slow bottom-0 right-40"></div>
      
      {/* Grid pattern */}
      <div className="grid-pattern absolute inset-0 opacity-[0.05]"></div>
      
      {/* Light beams */}
      <div className="beam-1 absolute h-[200%] w-28 bg-gradient-to-b from-green-300/0 via-green-300/20 to-green-300/0 rotate-45 animate-beam-move left-[10%] top-[-50%]"></div>
      <div className="beam-2 absolute h-[200%] w-40 bg-gradient-to-b from-purple-300/0 via-purple-300/15 to-purple-300/0 -rotate-45 animate-beam-move-reverse right-[20%] top-[-50%]"></div>

      {/* Pulse rings */}
      <div className="pulse-ring absolute w-96 h-96 rounded-full border-2 border-green-400/30 animate-pulse-ring left-1/4 top-1/3"></div>
      <div className="pulse-ring absolute w-96 h-96 rounded-full border-2 border-purple-400/25 animate-pulse-ring-delayed right-1/4 bottom-1/3"></div>
    </div>
  );
};

export default AnimatedBackground;
