export function SupportedProjectsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="h-[280px] animate-pulse rounded-[30px] bg-slate-100"
        />
      ))}
    </div>
  );
}

export default SupportedProjectsSkeleton;