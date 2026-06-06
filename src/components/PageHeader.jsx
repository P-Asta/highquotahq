import { Badge } from "@/components/ui/badge";

export function PageHeader({ eyebrow, title, children, action }) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-normal text-[#171717] md:text-5xl">{title}</h1>
        {children ? <p className="mt-4 text-lg leading-8 text-[#4d4d4d]">{children}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
