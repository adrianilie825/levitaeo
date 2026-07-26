export default function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse border border-[#ECE8E2] bg-white"
          aria-hidden
        >
          <div className="aspect-[4/5] bg-[#F3F0EA]" />
          <div className="space-y-4 p-6">
            <div className="h-3 w-24 bg-[#F3F0EA]" />
            <div className="h-6 w-3/4 bg-[#F3F0EA]" />
            <div className="space-y-3 pt-2">
              <div className="h-3 w-full bg-[#F3F0EA]" />
              <div className="h-3 w-full bg-[#F3F0EA]" />
              <div className="h-3 w-2/3 bg-[#F3F0EA]" />
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <div className="h-11 w-full bg-[#F3F0EA]" />
              <div className="h-11 w-full bg-[#F3F0EA]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
