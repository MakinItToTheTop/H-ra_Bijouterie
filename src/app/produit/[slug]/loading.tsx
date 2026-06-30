export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
      <div className="skeleton mb-8 h-4 w-64 rounded-full" />
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="skeleton aspect-[4/5] w-full rounded-[30px] md:aspect-[5/6]" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton aspect-square rounded-[18px]" />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-[30px] border border-line bg-white p-8">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-10 w-3/4 rounded-full" />
          <div className="skeleton h-4 w-40 rounded-full" />
          <div className="skeleton h-12 w-48 rounded-full" />
          <div className="skeleton h-24 w-full rounded-[22px]" />
          <div className="skeleton h-32 w-full rounded-[22px]" />
          <div className="skeleton h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
