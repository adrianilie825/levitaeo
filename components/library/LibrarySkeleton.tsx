export default function LibrarySkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-hidden>
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse border-b border-[#ECE8E2] pb-12 last:border-b-0 last:pb-0"
        >
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-x-14 xl:gap-x-16">
            <div className="min-h-[240px] bg-[#F3F0EA] sm:min-h-[280px] lg:min-h-[320px]" />

            <div className="space-y-4 lg:pt-2">
              <div className="h-3 w-24 bg-[#F3F0EA]" />
              <div className="h-8 w-3/4 bg-[#F3F0EA]" />
              <div className="h-4 w-1/2 bg-[#F3F0EA]" />
              <div className="space-y-3 pt-4">
                <div className="h-3 w-full bg-[#F3F0EA]" />
                <div className="h-3 w-full bg-[#F3F0EA]" />
                <div className="h-3 w-2/3 bg-[#F3F0EA]" />
              </div>
              <div className="flex flex-col gap-3 pt-6">
                <div className="h-11 w-full bg-[#F3F0EA]" />
                <div className="h-10 w-full bg-[#F3F0EA]" />
                <div className="h-10 w-full bg-[#F3F0EA]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
