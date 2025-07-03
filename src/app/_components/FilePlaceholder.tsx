export default function FilePlaceholder() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-7xl mt-8">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-4 rounded-xl bg-white/10 p-4"
            >
              <div className="self-center w-32 h-32 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-6 bg-white/20 rounded w-3/4 mx-auto animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-1/2 mx-auto animate-pulse" />
              <div className="flex self-center gap-2 mt-2">
                <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
                <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
    );
}