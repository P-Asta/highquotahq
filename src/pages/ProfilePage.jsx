import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { allCollections, boardTypes, getRunValue, normalizeTimestamp, versions } from "@/lib/boards";
import { db } from "@/lib/firebase";
import { LoadingPanel } from "@/components/LoadingPanel";
import { PageHeader } from "@/components/PageHeader";
import { RunDetailsDialog } from "@/components/RunDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProfilePage() {
  const params = useParams();
  const [search] = useSearchParams();
  const username = params.username || search.get("username") || "";
  const [profile, setProfile] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(!!username);
  const [status, setStatus] = useState(username ? "" : "Choose a profile from a leaderboard.");

  useEffect(() => {
    if (!username) return;
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setStatus("");
      try {
        const users = await getDocs(query(collection(db, "users"), where("username", "==", username)));
        if (users.empty) {
          if (!cancelled) {
            setStatus("Profile not found.");
            setLoading(false);
          }
          return;
        }
        const userData = users.docs[0].data();
        if (!cancelled) setProfile(userData);

        const foundRuns = [];
        for (const collectionName of allCollections) {
          const snapshot = await getDocs(collection(db, collectionName));
          const collectionRuns = snapshot.docs.map((doc) => ({ id: doc.id, collectionName, ...doc.data() }));
          const ranks = rankCollectionRuns(collectionRuns, getBoardType({ collectionName }));
          collectionRuns
            .filter((run) => run.players?.includes(username))
            .forEach((run) => foundRuns.push({ ...run, globalRank: ranks.get(run.id) || null }));
        }
        if (!cancelled) {
          setRuns(foundRuns);
          setStatus("");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus("Could not load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const groupedRuns = useMemo(() => {
    return {
      vanilla: runs.filter((run) => run.collectionName.startsWith("leaderboards")),
      modded: runs.filter((run) => run.collectionName.startsWith("modded"))
    };
  }, [runs]);

  return (
    <section className="section-shell">
      <PageHeader eyebrow="profile" title={profile?.username || "Player Profile"}>
        Player information and submitted records pulled from existing Firebase collections.
      </PageHeader>

      {loading ? <LoadingPanel variant="profile" /> : null}
      {!loading && status ? <Card className="p-5 text-[#4d4d4d]">{status}</Card> : null}

      {!loading && profile ? (
        <div className="grid gap-4">
          <Card className="p-6 text-center">
            <img src={profile.profilePicture || "/default-avatar.png"} alt="" className="mx-auto h-28 w-28 rounded-full object-cover shadow-card" />
            <h2 className="mt-5 text-3xl font-bold text-[#171717]">{profile.username}</h2>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge>{profile.pronouns || "Pronouns not set"}</Badge>
              <Badge>{profile.country || "Country not set"}</Badge>
              <Badge>Joined {profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : profile.createdAt || "N/A"}</Badge>
            </div>
            <p className="mx-auto mt-5 max-w-2xl rounded-lg bg-[#fafafa] p-4 text-left text-[#4d4d4d] shadow-border">{profile.bio || "No bio available."}</p>
          </Card>

          <RunGroup title="Lethal Company" runs={groupedRuns.vanilla} />
          <RunGroup title="Modded Lethal Company" runs={groupedRuns.modded} />
        </div>
      ) : null}
    </section>
  );
}

function RunGroup({ title, runs }) {
  const [filters, setFilters] = useState({
    status: "all",
    board: "all",
    playerCount: "all",
    version: "all"
  });
  const [selectedRun, setSelectedRun] = useState(null);
  const selectedBoardType = selectedRun ? getBoardType(selectedRun) : "hq";

  const availableVersions = useMemo(() => {
    const found = new Set(runs.map((run) => run.version).filter(Boolean));
    return versions.filter((version) => found.has(version));
  }, [runs]);

  const filteredRuns = useMemo(() => {
    return runs
      .filter((run) => filters.status === "all" || (filters.status === "verified" ? run.verified === true : run.verified !== true))
      .filter((run) => filters.board === "all" || getBoardType(run) === filters.board)
      .filter((run) => filters.playerCount === "all" || String(run.players?.length || 0) === filters.playerCount)
      .filter((run) => filters.version === "all" || run.version === filters.version)
      .sort((a, b) => {
        const aPending = a.verified !== true ? 1 : 0;
        const bPending = b.verified !== true ? 1 : 0;
        if (aPending !== bPending) return aPending - bPending;
        return getRunValue(b, getBoardType(b)) - getRunValue(a, getBoardType(a));
      });
  }, [filters, runs]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#171717]">{title}</h3>
          {runs.length > 0 ? <p className="mt-1 text-sm text-[#666]">{filteredRuns.length.toLocaleString()} of {runs.length.toLocaleString()} runs</p> : null}
        </div>
        {runs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[42rem] lg:grid-cols-4">
            <FilterSelect label="Status" value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </FilterSelect>
            <FilterSelect label="Board" value={filters.board} onValueChange={(value) => updateFilter("board", value)}>
              <SelectItem value="all">All boards</SelectItem>
              {Object.values(boardTypes).map((board) => (
                <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect label="Players" value={filters.playerCount} onValueChange={(value) => updateFilter("playerCount", value)}>
              <SelectItem value="all">Any players</SelectItem>
              {["1", "2", "3", "4"].map((count) => (
                <SelectItem key={count} value={count}>{count} Player{count === "1" ? "" : "s"}</SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect label="Version" value={filters.version} onValueChange={(value) => updateFilter("version", value)}>
              <SelectItem value="all">All versions</SelectItem>
              {availableVersions.map((version) => (
                <SelectItem key={version} value={version}>{version}</SelectItem>
              ))}
            </FilterSelect>
          </div>
        ) : null}
      </div>
      {runs.length === 0 ? (
        <p className="mt-3 text-[#4d4d4d]">No runs found.</p>
      ) : filteredRuns.length === 0 ? (
        <p className="mt-4 rounded-md bg-[#fafafa] p-4 text-sm text-[#4d4d4d] shadow-border">No runs match the selected filters.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {filteredRuns.map((run) => {
            const boardType = getBoardType(run);
            const board = boardTypes[boardType];
            const progress = Number(run.verificationProgress || 0);
            const isPending = run.verified !== true;
            return (
              <button
                key={`${run.collectionName}-${run.id}`}
                type="button"
                className="focus-ring grid w-full cursor-pointer gap-3 rounded-lg bg-white p-4 text-left shadow-border transition hover:bg-[#fafafa] md:grid-cols-[1fr_auto]"
                onClick={() => setSelectedRun(run)}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#171717]">{run.players?.join(", ") || "Unknown players"}</p>
                    <Badge>{isPending ? "Pending" : "Verified"}</Badge>
                    {run.globalRank ? <Badge>Global #{run.globalRank}</Badge> : null}
                    <Badge>{board.name}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-[#666]">{run.collectionName} - {run.version || "Unknown version"}</p>
                  {isPending ? (
                    <div className="mt-3 max-w-md">
                      <p className="text-sm text-[#4d4d4d]">
                        {run.claimedBy ? `Claimed by ${run.claimedBy}${run.claimedAt ? ` - ${normalizeTimestamp(run.claimedAt)}` : ""}` : "Not claimed by a verifier yet."}
                      </p>
                      {progress > 0 ? (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#fafafa] shadow-border dark:bg-black">
                            <div className="h-full bg-[#171717] dark:bg-white" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="font-mono text-xs text-[#666]">{progress}%</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {run.publicComments ? <p className="mt-3 text-sm leading-6 text-[#4d4d4d]">{run.publicComments}</p> : null}
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-[#666]">{board.metricLabel}</p>
                  <p className="text-lg font-semibold text-[#171717]">{getRunValue(run, boardType).toLocaleString()}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <Link className="mt-4 inline-flex text-sm font-medium text-[#0072f5] hover:underline" to="/leaderboards/vanilla">Open leaderboards</Link>
      <RunDetailsDialog run={selectedRun} boardType={selectedBoardType} open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)} />
    </Card>
  );
}

function FilterSelect({ label, value, onValueChange, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-[#666]">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </label>
  );
}

function getBoardType(run) {
  if (run.collectionName.includes("sdc")) return "sdc";
  if (run.collectionName.includes("smhq")) return "smhq";
  return "hq";
}

function rankCollectionRuns(runs, boardType) {
  const ranks = new Map();
  const verifiedRuns = runs
    .filter((run) => run.verified === true)
    .sort((a, b) => getRunValue(b, boardType) - getRunValue(a, boardType));

  let rank = 0;
  let previousValue = null;
  verifiedRuns.forEach((run, index) => {
    const value = getRunValue(run, boardType);
    if (value !== previousValue) rank = index + 1;
    previousValue = value;
    ranks.set(run.id, rank);
  });

  return ranks;
}
