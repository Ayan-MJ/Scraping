export function AnimatedGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] bg-brand-green/20 rounded-full blur-[120px] animate-float opacity-50" />
      <div className="absolute top-[40%] -right-[5%] w-[400px] h-[400px] bg-brand-green/10 rounded-full blur-[100px] animate-float-slow opacity-30" />
    </div>
  );
} 