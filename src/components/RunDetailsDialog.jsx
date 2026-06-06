import { ExternalLink, PlayCircle } from "lucide-react";
import { boardTypes, getRunValue, normalizeTimestamp } from "@/lib/boards";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function RunDetailsDialog({ run, boardType = "hq", open, onOpenChange }) {
  const board = boardTypes[boardType] || boardTypes.hq;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {run ? (
        <DialogContent className="flex h-[min(92vh,900px)] max-h-[calc(100vh-2rem)] max-w-5xl flex-col p-0" showClose>
          <DialogHeader className="shrink-0 p-5 pr-16 shadow-[inset_0_-1px_0_#ebebeb]">
            <div className="min-w-0">
              <Badge>run details</Badge>
              <DialogTitle className="mt-4">{board.name}</DialogTitle>
              <DialogDescription>{(run.players || []).join(", ") || "Unknown players"}</DialogDescription>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Players" value={(run.players || []).join(", ")} />
              <Detail label="Version" value={run.version || "N/A"} />
              <Detail label="Date" value={normalizeTimestamp(run.date)} />
              <Detail label={board.metricLabel} value={getRunValue(run, boardType).toLocaleString()} />
              <Detail label="Verified by" value={run.verifiedBy || "N/A"} />
              <Detail label="Verified at" value={normalizeTimestamp(run.verifiedAt)} />
              {run.moon ? <Detail label="Moon" value={run.moon} /> : null}
              {run.scrapType ? <Detail label="Scrap type" value={run.scrapType} /> : null}
              {run.publicComments ? <Detail label="Comments" value={run.publicComments} wide /> : null}
              {run.spreadsheet ? <LinkDetail label="Spreadsheet" href={run.spreadsheet} /> : null}
            </dl>
            <EvidenceSection videos={run.videos} />
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function Detail({ label, value, wide = false }) {
  return (
    <div className={cn("rounded-md bg-[#fafafa] p-3 shadow-[0_0_0_1px_rgb(235,235,235)]", wide && "sm:col-span-2 lg:col-span-3")}>
      <dt className="text-xs font-medium uppercase text-[#666]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-[#171717]">{value || "N/A"}</dd>
    </div>
  );
}

function LinkDetail({ label, href }) {
  return (
    <div className="rounded-md bg-[#fafafa] p-3 shadow-[0_0_0_1px_rgb(235,235,235)]">
      <dt className="text-xs font-medium uppercase text-[#666]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#171717]">
        <a className="text-[#0072f5] hover:underline" href={href} target="_blank" rel="noreferrer">
          Open link
        </a>
      </dd>
    </div>
  );
}

function EvidenceSection({ videos }) {
  const entries = getVideoEntries(videos);

  if (entries.length === 0) {
    return (
      <div className="mt-5 rounded-md bg-[#fafafa] p-4 text-sm text-[#4d4d4d] shadow-border">
        No video evidence attached.
      </div>
    );
  }

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <PlayCircle className="h-4 w-4" />
        <h3 className="text-lg font-semibold text-[#171717]">Video Evidence</h3>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((entry, index) => (
          <VideoCard key={`${entry.url}-${index}`} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function VideoCard({ entry }) {
  const embedUrl = getYouTubeEmbedUrl(entry.url);

  return (
    <div className="overflow-hidden rounded-lg bg-[#fafafa] shadow-border">
      {embedUrl ? (
        <iframe
          className="aspect-video w-full bg-black"
          src={embedUrl}
          title={`${entry.player} evidence`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-white p-5 text-center shadow-[inset_0_-1px_0_#ebebeb]">
          <a className="inline-flex items-center gap-2 text-sm font-medium text-[#0072f5] hover:underline" href={entry.url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open evidence link
          </a>
        </div>
      )}
      <div className="p-3">
        <p className="text-sm font-semibold text-[#171717]">{entry.player}</p>
        <a className="mt-1 block truncate text-xs text-[#0072f5] hover:underline" href={entry.url} target="_blank" rel="noreferrer">
          {entry.url}
        </a>
      </div>
    </div>
  );
}

function getVideoEntries(videos) {
  if (!videos) return [];
  if (Array.isArray(videos)) return videos.flatMap((url) => makeVideoEntries("Video", url));
  if (typeof videos === "string") return makeVideoEntries("Video", videos);

  return Object.entries(videos).flatMap(([player, urls]) => makeVideoEntries(player, urls));
}

function makeVideoEntries(player, value) {
  const urls = Array.isArray(value) ? value : String(value || "").split(/[\n,]+/);
  return urls
    .map((url) => normalizeUrl(url))
    .filter(Boolean)
    .map((url) => ({ player, url }));
}

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^(youtube\.com|youtu\.be)\//i.test(trimmed)) return `https://${trimmed}`;
  if (trimmed.startsWith("www.")) return `https://${trimmed}`;
  return trimmed;
}

function getYouTubeEmbedUrl(rawUrl) {
  try {
    const url = new URL(normalizeUrl(rawUrl));
    const host = url.hostname.replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host.endsWith("youtube.com")) {
      id = url.searchParams.get("v") || "";
      if (!id && url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2] || "";
      if (!id && url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] || "";
    }

    return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
  } catch {
    return "";
  }
}
