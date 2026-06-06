import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { ChevronDown, UploadCloud } from "lucide-react";
import { db } from "@/lib/firebase";
import { boardTypes, getCollectionName, getRunValue, getTrack, moons, tracks, versions } from "@/lib/boards";
import { LoadingPanel } from "@/components/LoadingPanel";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RunDetailsDialog } from "@/components/RunDetailsDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const cacheMs = 24 * 60 * 60 * 1000;

const initialFilters = {
  playerCount: "1",
  versions: [],
  unrestricted: "standard",
  moon: "41-Experimentation",
  scrapType: "any"
};

export function LeaderboardsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const trackId = params.track === "modded" ? "modded" : "vanilla";
  const track = getTrack(trackId);
  const [boardType, setBoardType] = useState("hq");
  const [filters, setFilters] = useState(initialFilters);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRun, setSelectedRun] = useState(null);

  const collectionName = getCollectionName(trackId, boardType);
  const board = boardTypes[boardType];

  useEffect(() => {
    setFilters((value) => ({ ...initialFilters, playerCount: value.playerCount || "1" }));
    setSelectedRun(null);
  }, [trackId, boardType]);

  useEffect(() => {
    let cancelled = false;

    async function loadRuns() {
      setLoading(true);
      setError("");
      const cacheKey = `hq-react-cache-${collectionName}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < cacheMs) {
            setRuns(parsed.runs);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }

      try {
        const snapshot = await getDocs(collection(db, collectionName));
        const nextRuns = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (!cancelled) {
          setRuns(nextRuns);
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), runs: nextRuns }));
        }
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) setError("Could not load leaderboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRuns();
    return () => {
      cancelled = true;
    };
  }, [collectionName]);

  const filteredRuns = useMemo(() => {
    const sorted = runs
      .filter((run) => run.verified === true)
      .filter((run) => filters.playerCount === "any" || String(run.players?.length || 0) === filters.playerCount)
      .filter((run) => filters.versions.length === 0 || filters.versions.includes(run.version))
      .filter((run) => filters.unrestricted === "include" || !run.unrestricted)
      .filter((run) => (boardType === "hq" ? true : filters.moon === "any" || run.moon === filters.moon))
      .filter((run) => (boardType === "sdc" && filters.scrapType !== "any" ? run.scrapType === filters.scrapType : true))
      .sort((a, b) => getRunValue(b, boardType) - getRunValue(a, boardType));

    let rank = 0;
    let previousValue = null;
    return sorted.map((run, index) => {
      const value = getRunValue(run, boardType);
      if (value !== previousValue) rank = index + 1;
      previousValue = value;
      return { ...run, rank };
    });
  }, [runs, filters, boardType]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const toggleVersion = (version) => {
    setFilters((current) => ({
      ...current,
      versions: current.versions.includes(version)
        ? current.versions.filter((item) => item !== version)
        : [...current.versions, version]
    }));
  };

  return (
    <section className="section-shell">
      <PageHeader
        eyebrow={track.shortName}
        title={`${track.name} Leaderboards`}
        action={
          <Button asChild variant="secondary">
            <Link to={`/submit/${trackId}`}>
              <UploadCloud className="h-4 w-4" />
              Submit run
            </Link>
          </Button>
        }
      >
        Filter verified runs by board, players, version, moon, and restrictions.
      </PageHeader>

      <Card className="mb-4 p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SelectField label="Track">
            <MenuSelect value={trackId} onValueChange={(value) => navigate(`/leaderboards/${value}`)}>
              {Object.values(tracks).map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </MenuSelect>
          </SelectField>

          <SelectField label="Board">
            <MenuSelect value={boardType} onValueChange={setBoardType}>
              {Object.values(boardTypes).map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </MenuSelect>
          </SelectField>

          <SelectField label="Players">
            <MenuSelect value={filters.playerCount} onValueChange={(value) => updateFilter("playerCount", value)}>
              <SelectItem value="any">Any players</SelectItem>
              {["1", "2", "3", "4"].map((count) => (
                <SelectItem key={count} value={count}>{count} Player{count === "1" ? "" : "s"}</SelectItem>
              ))}
            </MenuSelect>
          </SelectField>

          <SelectField label="Version">
            <VersionMultiSelect selected={filters.versions} onToggle={toggleVersion} onClear={() => updateFilter("versions", [])} />
          </SelectField>

          {boardType !== "hq" ? (
            <SelectField label="Moon">
              <MenuSelect value={filters.moon} onValueChange={(value) => updateFilter("moon", value)}>
                <SelectItem value="any">Any moon</SelectItem>
                {moons.map((moon) => (
                  <SelectItem key={moon} value={moon}>{moon}</SelectItem>
                ))}
              </MenuSelect>
            </SelectField>
          ) : null}

          {boardType === "sdc" ? (
            <SelectField label="Scrap type">
              <MenuSelect value={filters.scrapType} onValueChange={(value) => updateFilter("scrapType", value)}>
                <SelectItem value="any">Any scrap type</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
              </MenuSelect>
            </SelectField>
          ) : null}

          <SelectField label="Restrictions">
            <MenuSelect value={filters.unrestricted} onValueChange={(value) => updateFilter("unrestricted", value)}>
              <SelectItem value="standard">Standard only</SelectItem>
              <SelectItem value="include">Include unrestricted</SelectItem>
            </MenuSelect>
          </SelectField>
        </div>
      </Card>

      {loading ? (
        <LoadingPanel variant="leaderboard" />
      ) : error ? (
        <Card className="p-5 text-[#ff5b4f]">{error}</Card>
      ) : filteredRuns.length === 0 ? (
        <Card className="p-5 text-[#4d4d4d]">No runs found with the selected filters.</Card>
      ) : (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-semibold uppercase text-[#666]">{board.name}</p>
              <p className="mt-1 text-sm text-[#4d4d4d]">{filteredRuns.length.toLocaleString()} verified records</p>
            </div>
            <p className="font-mono text-xs text-[#666]">{track.shortName} / {filters.playerCount === "any" ? "Any players" : `${filters.playerCount}P`}</p>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="hidden grid-cols-[52px_1fr_168px] px-4 py-3 text-xs font-semibold uppercase text-[#666] shadow-[inset_0_-1px_0_#ebebeb] md:grid">
              <span>Rank</span>
              <span>Run</span>
              <span className="text-right">{board.metricLabel}</span>
            </div>
            <div className="divide-y divide-[#ebebeb] dark:divide-white/15">
              {filteredRuns.map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  board={board}
                  boardType={boardType}
                  onOpen={() => setSelectedRun(run)}
                />
              ))}
            </div>
          </Card>
        </div>
      )}

      <RunDetailsDialog run={selectedRun} boardType={boardType} open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)} />
    </section>
  );
}

function RunRow({ run, board, boardType, onOpen }) {
  const topRank = run.rank <= 3;
  const value = getRunValue(run, boardType);
  const players = run.players || [];
  const meta = [
    run.version || "Unknown version",
    run.moon,
    run.scrapType,
    run.unrestricted ? "Unrestricted" : null
  ].filter(Boolean);

  return (
    <div
      role="button"
      tabIndex={0}
      data-top-rank={topRank ? "true" : undefined}
      className={cn(
        "record-row focus-ring group grid w-full cursor-pointer gap-3 bg-white p-4 text-left transition-colors dark:bg-black md:grid-cols-[52px_1fr_168px] md:items-center"
      )}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="flex items-center">
        <span className={cn(
          "font-mono text-sm font-semibold text-[#666]",
          topRank && "text-[#171717] dark:text-white"
        )}>
          #{run.rank}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 text-base font-semibold leading-6 text-[#171717]">
            {players.length ? players.map((player, index) => (
              <span key={`${player}-${index}`}>
                <Link className="text-[#171717] underline-offset-4 hover:text-[#0070f3] hover:underline dark:hover:text-white" to={`/profile/${encodeURIComponent(player)}`} onClick={(event) => event.stopPropagation()}>{player}</Link>
                {index < players.length - 1 ? <span className="text-[#888]">, </span> : null}
              </span>
            )) : "Unknown players"}
          </p>
          {topRank ? <Badge className="h-5 bg-[#fafafa] px-2 text-[11px] text-[#4d4d4d] shadow-border dark:bg-black dark:text-white">Top {run.rank}</Badge> : null}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-[#666]">
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 md:block md:text-right">
        <span className="text-xs font-medium uppercase text-[#666] md:hidden">{board.metricLabel}</span>
        <p className="text-xl font-semibold tracking-normal text-[#171717] md:text-2xl">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function SelectField({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-[#666]">{label}</span>
      {children}
    </label>
  );
}

function MenuSelect({ value, onValueChange, placeholder, children }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

function VersionMultiSelect({ selected, onToggle, onClear }) {
  const label = selected.length === 0 ? "All versions" : selected.length === 1 ? selected[0] : `${selected.length} versions`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-ring flex h-10 w-full items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-left text-sm text-[#171717] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-black dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuItem onSelect={(event) => { event.preventDefault(); onClear(); }}>
          All versions
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {versions.map((version) => (
          <DropdownMenuCheckboxItem
            key={version}
            checked={selected.includes(version)}
            onCheckedChange={() => onToggle(version)}
            onSelect={(event) => event.preventDefault()}
          >
            {version}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
