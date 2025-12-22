export function ProductCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Image Skeleton */}
      <div className="relative h-64 w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
        style={{ animation: 'shimmer 2s infinite' }}
      />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category Badge */}
        <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Price */}
        <div className="h-7 w-24 animate-pulse rounded bg-gray-300" />

        {/* Features */}
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-16 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="p-6 space-y-4">
        {/* Icon & Badge */}
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Price */}
        <div className="h-8 w-32 animate-pulse rounded bg-gray-300" />

        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Duration */}
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />

        {/* Buttons */}
        <div className="flex gap-2">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[500px] w-full overflow-hidden bg-gray-100">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />

      <div className="relative flex h-full items-center justify-center">
        <div className="space-y-6 text-center px-4">
          <div className="mx-auto h-12 w-3/4 max-w-3xl animate-pulse rounded bg-white/30" />
          <div className="mx-auto h-12 w-2/3 max-w-2xl animate-pulse rounded bg-white/30" />
          <div className="mx-auto h-6 w-1/2 max-w-xl animate-pulse rounded bg-white/20" />
          <div className="flex justify-center gap-4 pt-4">
            <div className="h-12 w-32 animate-pulse rounded-lg bg-white/30" />
            <div className="h-12 w-32 animate-pulse rounded-lg bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReviewSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-5 w-5 animate-pulse rounded bg-gray-200" />
        ))}
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

// Add shimmer animation to global CSS
// Add this to your globals.css:
/*
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
*/
