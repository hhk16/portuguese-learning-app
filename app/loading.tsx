export default function Loading() {
  return (
    <div className="container-max flex items-center justify-center min-h-[50vh]">
      <div className="grid gap-4 text-center">
        <div className="relative">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-white/20 border-t-emerald-400 animate-spin"></div>
          <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full border-4 border-transparent border-r-blue-400 animate-spin-reverse"></div>
        </div>
        <div className="text-lg font-semibold text-white/80">Loading...</div>
        <div className="text-sm text-white/60">Preparing your Portuguese lesson</div>
      </div>
    </div>
  );
} 