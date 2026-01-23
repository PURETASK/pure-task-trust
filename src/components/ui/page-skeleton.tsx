import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  variant?: 'default' | 'cards' | 'list' | 'profile';
}

export function PageSkeleton({ 
  showHeader = false, 
  showFooter = false,
  variant = 'default' 
}: PageSkeletonProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple loading header placeholder */}
      {showHeader && (
        <div className="h-16 border-b border-border/50 bg-background/90 backdrop-blur-xl" />
      )}
      <main className="flex-1 pt-8 pb-12">
        <div className="container max-w-4xl">
          {variant === 'default' && <DefaultSkeleton />}
          {variant === 'cards' && <CardsSkeleton />}
          {variant === 'list' && <ListSkeleton />}
          {variant === 'profile' && <ProfileSkeleton />}
        </div>
      </main>
      {/* Simple loading footer placeholder */}
      {showFooter && (
        <div className="h-24 border-t border-border/50 bg-muted/30" />
      )}
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}

// Content skeleton for use inside cards/sections
export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}
