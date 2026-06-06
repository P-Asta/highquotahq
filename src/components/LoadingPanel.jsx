import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoadingPanel({ variant = "page", rows = 3, className }) {
  if (variant === "leaderboard") return <LeaderboardSkeleton rows={rows} className={className} />;
  if (variant === "profile") return <ProfileSkeleton className={className} />;
  if (variant === "about-team") return <AboutTeamSkeleton className={className} />;
  if (variant === "admin") return <AdminSkeleton className={className} />;
  if (variant === "review") return <ReviewSkeleton className={className} />;

  return (
    <Card className={cn("overflow-hidden p-5", className)} aria-busy="true" aria-label="Loading">
      <div className="grid gap-5">
        <div className="grid gap-3">
          <SkeletonBlock className="h-5 w-24 rounded-full" />
          <SkeletonBlock className="h-8 w-full max-w-md rounded-md" />
          <SkeletonBlock className="h-4 w-full max-w-2xl rounded-md" />
          <SkeletonBlock className="h-4 w-2/3 max-w-xl rounded-md" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonBlock className="h-10 rounded-md" />
          <SkeletonBlock className="h-10 rounded-md" />
          <SkeletonBlock className="h-10 rounded-md" />
          <SkeletonBlock className="h-10 rounded-md" />
        </div>
        <SkeletonRows rows={rows} />
      </div>
    </Card>
  );
}

function LeaderboardSkeleton({ rows = 6, className }) {
  return (
    <div className={cn("grid gap-3", className)} aria-busy="true" aria-label="Loading">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div className="grid gap-2">
          <SkeletonBlock className="h-4 w-32 rounded-md" />
          <SkeletonBlock className="h-4 w-40 rounded-md" />
        </div>
        <SkeletonBlock className="h-4 w-28 rounded-md" />
      </div>
      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[52px_1fr_168px] px-4 py-3 shadow-[inset_0_-1px_0_#ebebeb] md:grid">
          <SkeletonBlock className="h-3 w-10 rounded-md" />
          <SkeletonBlock className="h-3 w-10 rounded-md" />
          <SkeletonBlock className="ml-auto h-3 w-20 rounded-md" />
        </div>
        <div className="divide-y divide-[#ebebeb] dark:divide-white/15">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="grid gap-3 bg-white p-4 dark:bg-black md:grid-cols-[52px_1fr_168px] md:items-center">
              <SkeletonBlock className="h-4 w-8 rounded-md" />
              <div className="grid min-w-0 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SkeletonBlock className="h-5 w-52 max-w-full rounded-md" />
                  {index < 3 ? <SkeletonBlock className="h-5 w-14 rounded-full" /> : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <SkeletonBlock className="h-3 w-12 rounded-md" />
                  <SkeletonBlock className="h-3 w-24 rounded-md" />
                  <SkeletonBlock className="h-3 w-16 rounded-md" />
                </div>
              </div>
              <SkeletonBlock className="h-7 w-28 rounded-md md:ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProfileSkeleton({ className }) {
  return (
    <div className={cn("grid gap-4", className)} aria-busy="true" aria-label="Loading">
      <Card className="p-6 text-center">
        <SkeletonBlock className="mx-auto h-28 w-28 rounded-full" />
        <SkeletonBlock className="mx-auto mt-5 h-9 w-48 rounded-md" />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="h-6 w-40 rounded-full" />
        </div>
        <div className="mx-auto mt-5 grid max-w-2xl gap-2 rounded-lg bg-[#fafafa] p-4 shadow-border">
          <SkeletonBlock className="h-4 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-5/6 rounded-md" />
          <SkeletonBlock className="h-4 w-2/3 rounded-md" />
        </div>
      </Card>
      <RunGroupSkeleton />
      <RunGroupSkeleton />
    </div>
  );
}

function RunGroupSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <SkeletonBlock className="h-6 w-44 rounded-md" />
          <SkeletonBlock className="h-4 w-24 rounded-md" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:w-[42rem] lg:grid-cols-4">
          <FilterSkeleton />
          <FilterSkeleton />
          <FilterSkeleton />
          <FilterSkeleton />
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="grid gap-3 rounded-lg bg-white p-4 shadow-border md:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <SkeletonBlock className="h-5 w-44 rounded-md" />
                <SkeletonBlock className="h-6 w-20 rounded-full" />
                <SkeletonBlock className="h-6 w-28 rounded-full" />
              </div>
              <SkeletonBlock className="h-3 w-64 max-w-full rounded-md" />
              <SkeletonBlock className="mt-1 h-4 w-80 max-w-full rounded-md" />
            </div>
            <div className="grid gap-2 md:justify-items-end">
              <SkeletonBlock className="h-4 w-24 rounded-md" />
              <SkeletonBlock className="h-6 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AboutTeamSkeleton({ className }) {
  return (
    <Card className={cn("p-5", className)} aria-busy="true" aria-label="Loading">
      <SkeletonBlock className="h-8 w-36 rounded-md" />
      <div className="mt-5 grid gap-5">
        {Array.from({ length: 4 }).map((_, groupIndex) => (
          <div key={groupIndex} className="pt-4 shadow-[inset_0_1px_0_#ebebeb]">
            <SkeletonBlock className="h-4 w-32 rounded-md" />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((__, memberIndex) => (
                <div key={memberIndex} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-border">
                  <SkeletonBlock className="h-10 w-10 rounded-full" />
                  <SkeletonBlock className="h-4 w-32 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AdminSkeleton({ className }) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-[240px_1fr]", className)} aria-busy="true" aria-label="Loading">
      <Card className="grid content-start gap-2 p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-10 rounded-md" />
        ))}
      </Card>
      <Card className="p-5">
        <SkeletonBlock className="h-8 w-56 rounded-md" />
        <QueueRowsSkeleton className="mt-5" rows={4} />
      </Card>
    </div>
  );
}

function ReviewSkeleton({ className }) {
  return (
    <div className={cn("grid gap-4", className)} aria-busy="true" aria-label="Loading">
      <div className="grid gap-3">
        <SkeletonBlock className="h-5 w-20 rounded-full" />
        <SkeletonBlock className="h-10 w-64 max-w-full rounded-md" />
        <SkeletonBlock className="h-5 w-full max-w-2xl rounded-md" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-4">
              <SkeletonBlock className="h-6 w-36 rounded-full" />
              <SkeletonBlock className="h-8 w-48 rounded-md" />
            </div>
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-5 grid gap-4">
            <FieldSkeleton />
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <div className="rounded-lg bg-[#fafafa] p-4 shadow-border">
              <SkeletonBlock className="mb-4 h-5 w-32 rounded-md" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSkeleton />
                <FieldSkeleton />
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
            </div>
            <TextareaSkeleton />
            <TextareaSkeleton />
            <TextareaSkeleton />
          </div>
        </Card>
        <aside className="grid content-start gap-4">
          <SidePanelSkeleton />
          <SidePanelSkeleton />
          <SidePanelSkeleton />
        </aside>
      </div>
    </div>
  );
}

function FieldSkeleton() {
  return (
    <div className="grid gap-2">
      <SkeletonBlock className="h-4 w-24 rounded-md" />
      <SkeletonBlock className="h-10 rounded-md" />
    </div>
  );
}

function TextareaSkeleton() {
  return (
    <div className="grid gap-2">
      <SkeletonBlock className="h-4 w-28 rounded-md" />
      <SkeletonBlock className="h-24 rounded-md" />
    </div>
  );
}

function SidePanelSkeleton() {
  return (
    <Card className="p-5">
      <SkeletonBlock className="h-7 w-32 rounded-md" />
      <SkeletonBlock className="mt-3 h-4 w-full rounded-md" />
      <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-md" />
      <div className="mt-5 grid gap-2">
        <SkeletonBlock className="h-10 rounded-md" />
        <SkeletonBlock className="h-10 rounded-md" />
      </div>
    </Card>
  );
}

function FilterSkeleton() {
  return (
    <div className="grid gap-2">
      <SkeletonBlock className="h-4 w-16 rounded-md" />
      <SkeletonBlock className="h-10 rounded-md" />
    </div>
  );
}

export function SkeletonRows({ rows = 3, className }) {
  return <QueueRowsSkeleton rows={rows} className={className} />;
}

function QueueRowsSkeleton({ rows = 3, className }) {
  return (
    <div className={cn("grid gap-2", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid gap-2 rounded-md bg-white p-3 shadow-border sm:grid-cols-[2fr_1fr_96px]">
          <SkeletonBlock className="h-3 rounded-full" />
          <SkeletonBlock className="h-3 rounded-full" />
          <SkeletonBlock className="h-3 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlock({ className }) {
  return (
    <span
      className={cn(
        "block animate-pulse bg-[#f5f5f5] shadow-[inset_0_0_0_1px_#ebebeb] dark:bg-[#0a0a0a] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]",
        className
      )}
    />
  );
}
