import React from 'react';

/**
 * Reusable skeleton loading components for the KhetLink app.
 * Used as Suspense fallbacks and during Firebase data loading.
 */

export const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-neutral-200 rounded ${className}`} />
);

/** Full-page loading spinner used as React.lazy Suspense fallback */
export const PageLoadingSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
    {/* Page header skeleton */}
    <div className="space-y-3">
      <SkeletonPulse className="h-8 w-64" />
      <SkeletonPulse className="h-4 w-96 max-w-full" />
    </div>

    {/* Content grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CropCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/** Skeleton for a single crop/product card */
export const CropCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-neutral-200 p-0 shadow-xs overflow-hidden">
    {/* Image placeholder */}
    <SkeletonPulse className="h-44 w-full rounded-none" />
    
    <div className="p-4 space-y-3">
      {/* Title & badge */}
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-5 w-40" />
        <SkeletonPulse className="h-5 w-16 rounded-full" />
      </div>

      {/* Farmer info */}
      <div className="flex items-center gap-2">
        <SkeletonPulse className="h-4 w-4 rounded-full" />
        <SkeletonPulse className="h-3 w-32" />
      </div>

      {/* Price row */}
      <div className="flex items-baseline justify-between pt-1">
        <SkeletonPulse className="h-6 w-28" />
        <SkeletonPulse className="h-4 w-20" />
      </div>

      {/* Details row */}
      <div className="flex gap-2">
        <SkeletonPulse className="h-6 w-20 rounded-full" />
        <SkeletonPulse className="h-6 w-24 rounded-full" />
        <SkeletonPulse className="h-6 w-16 rounded-full" />
      </div>

      {/* Button */}
      <SkeletonPulse className="h-10 w-full rounded-xl" />
    </div>
  </div>
);

/** Skeleton for the marketplace page during initial load */
export const MarketplaceSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    {/* Filter bar */}
    <div className="flex flex-wrap gap-3 items-center">
      <SkeletonPulse className="h-10 w-64 rounded-xl" />
      <SkeletonPulse className="h-10 w-28 rounded-xl" />
      <SkeletonPulse className="h-10 w-28 rounded-xl" />
      <SkeletonPulse className="h-10 w-28 rounded-xl" />
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CropCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/** Skeleton for dashboard pages */
export const DashboardSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    {/* Profile header */}
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-16 w-16 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <SkeletonPulse className="h-6 w-48" />
          <SkeletonPulse className="h-4 w-64" />
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-7 w-16" />
        </div>
      ))}
    </div>

    {/* Content section */}
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
      <SkeletonPulse className="h-6 w-40" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <SkeletonPulse key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

/** Skeleton for AI Predictions charts */
export const PredictionsSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div className="space-y-2">
      <SkeletonPulse className="h-8 w-56" />
      <SkeletonPulse className="h-4 w-80 max-w-full" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <SkeletonPulse className="h-5 w-40" />
            <SkeletonPulse className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonPulse className="h-48 w-full rounded-xl" />
          <div className="space-y-2">
            <SkeletonPulse className="h-3 w-full" />
            <SkeletonPulse className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
