import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { allCollections, normalizeTimestamp } from "@/lib/boards";
import { LoadingPanel, SkeletonBlock, SkeletonRows } from "@/components/LoadingPanel";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const queueCollections = {
  vanilla: ["leaderboards_hq", "leaderboards_smhq", "leaderboards_sdc"],
  modded: ["modded_hq", "modded_smhq", "modded_sdc"]
};

export function AdminPage() {
  const auth = useAuth();
  const [tab, setTab] = useState("queue");
  const canAdmin = auth.roles.includes("admin") || auth.roles.includes("site-developer");
  const canVerifier = auth.roles.includes("verifier") || auth.roles.includes("site-developer");
  const canModdedVerifier = auth.roles.includes("modded-verifier") || auth.roles.includes("site-developer");

  if (auth.loading) {
    return <section className="section-shell"><LoadingPanel variant="admin" /></section>;
  }

  if (!auth.user || !auth.isStaff) {
    return <section className="section-shell"><Card className="p-5 text-[#4d4d4d]">Staff access required.</Card></section>;
  }

  return (
    <section className="section-shell">
      <PageHeader eyebrow="admin" title="Staff Tools">
        Verify queues, manage roles, and inspect recently verified runs in React.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="grid content-start gap-2 p-3">
          {[
            ["queue", "Main Queue", canVerifier],
            ["modded", "Modded Queue", canModdedVerifier],
            ["roles", "Role Controls", canAdmin],
            ["recent", "Recently Verified", true]
          ].filter(([, , allowed]) => allowed).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`focus-ring h-10 rounded-md px-3 text-left text-sm font-medium ${tab === id ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#fafafa]"}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </Card>

        {tab === "queue" ? <QueuePanel type="vanilla" verifierName={auth.username} /> : null}
        {tab === "modded" ? <QueuePanel type="modded" verifierName={auth.username} /> : null}
        {tab === "roles" ? <RolePanel /> : null}
        {tab === "recent" ? <RecentPanel /> : null}
      </div>
    </section>
  );
}

function QueuePanel({ type, verifierName }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  async function loadQueue() {
    setLoading(true);
    setStatus("");
    const nextRuns = [];
    try {
      for (const collectionName of queueCollections[type]) {
        const snapshot = await getDocs(query(collection(db, collectionName), where("verified", "==", false), orderBy("date", "asc")));
        snapshot.forEach((docSnapshot) => nextRuns.push({ id: docSnapshot.id, collectionName, ...docSnapshot.data() }));
      }
      setRuns(nextRuns);
      setStatus(nextRuns.length ? "" : "No unverified runs.");
    } catch (error) {
      console.error(error);
      setStatus("Could not load queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, [type]);

  async function claimRun(run) {
    await updateDoc(doc(db, run.collectionName, run.id), {
      claimedBy: verifierName,
      claimedAt: new Date()
    });
    await loadQueue();
  }

  return (
    <Card className="p-5">
      <h2 className="text-2xl font-semibold text-[#171717]">{type === "modded" ? "Modded Board Queue" : "Main Board Queue"}</h2>
      {loading ? <SkeletonRows className="mt-5" rows={4} /> : null}
      {!loading && status ? <p className="mt-4 text-[#4d4d4d]">{status}</p> : null}
      {!loading ? <div className="mt-5 grid gap-3">
        {runs.map((run) => (
          <div key={`${run.collectionName}-${run.id}`} className="grid gap-3 rounded-lg bg-white p-4 shadow-border transition-colors hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] md:grid-cols-[1fr_auto]">
            <Link to={`/admin/review/${type}/${run.collectionName}/${run.id}`} className="text-left">
              <p className="font-semibold text-[#171717]">{run.players?.join(", ") || "Unknown players"}</p>
              <p className="mt-1 text-sm text-[#4d4d4d]">{run.collectionName} - {normalizeTimestamp(run.date)} - {run.version || "N/A"}</p>
              <p className="mt-1 text-sm text-[#666]">Claimed by: {run.claimedBy || "Unclaimed"}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#fafafa] shadow-border dark:bg-black">
                  <div className="h-full bg-[#171717] dark:bg-white" style={{ width: `${Number(run.verificationProgress || 0)}%` }} />
                </div>
                <span className="font-mono text-xs text-[#666]">{Number(run.verificationProgress || 0)}%</span>
              </div>
            </Link>
            {!run.claimedBy ? <Button variant="secondary" onClick={() => claimRun(run)}>Claim</Button> : null}
          </div>
        ))}
      </div> : null}
    </Card>
  );
}

function RolePanel() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("admin");
  const [status, setStatus] = useState("");

  async function mutateRole(action) {
    setStatus("Updating...");
    try {
      const snapshot = await getDocs(query(collection(db, "users"), where("username", "==", username.trim())));
      if (snapshot.empty) {
        setStatus("User not found.");
        return;
      }
      const userDoc = snapshot.docs[0];
      const roles = userDoc.data().roles || [];
      const nextRoles = action === "add" ? Array.from(new Set([...roles, role])) : roles.filter((item) => item !== role);
      await updateDoc(userDoc.ref, { roles: nextRoles });
      setStatus(action === "add" ? "Role assigned." : "Role removed.");
    } catch (error) {
      console.error(error);
      setStatus("Role update failed.");
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-2xl font-semibold text-[#171717]">Role Controls</h2>
      <div className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <Label>Username</Label>
          <Input value={username} onChange={(event) => setUsername(event.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="verifier">Verifier</SelectItem>
              <SelectItem value="modded-verifier">Modded Verifier</SelectItem>
              <SelectItem value="site-developer">Site Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => mutateRole("add")}>Assign Role</Button>
          <Button variant="secondary" onClick={() => mutateRole("remove")}>Remove Role</Button>
        </div>
        {status ? <p className="text-sm text-[#4d4d4d]">{status}</p> : null}
      </div>
    </Card>
  );
}

function RecentPanel() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadRecent() {
      setLoading(true);
      setStatus("");
      const nextRuns = [];
      try {
        for (const collectionName of allCollections) {
          const snapshot = await getDocs(query(collection(db, collectionName), where("verifiedAt", ">", new Date(0)), orderBy("verifiedAt", "desc"), limit(10)));
          snapshot.forEach((docSnapshot) => nextRuns.push({ id: docSnapshot.id, collectionName, ...docSnapshot.data() }));
        }
        nextRuns.sort((a, b) => {
          const left = a.verifiedAt?.seconds || 0;
          const right = b.verifiedAt?.seconds || 0;
          return right - left;
        });
        setRuns(nextRuns.slice(0, 10));
        setStatus("");
      } catch (error) {
        console.error(error);
        setStatus("Could not load recently verified runs.");
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, []);

  return (
    <Card className="overflow-hidden p-5">
      <h2 className="text-2xl font-semibold text-[#171717]">Recently Verified Runs</h2>
      {loading ? <RecentTableSkeleton /> : null}
      {!loading && status ? <p className="mt-4 text-[#4d4d4d]">{status}</p> : null}
      {!loading ? <div className="mt-5 overflow-x-auto">
        <table className="min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-[#666]">
            <tr className="shadow-[inset_0_-1px_0_#ebebeb]">
              <th className="px-3 py-3">Run ID</th>
              <th className="px-3 py-3">Collection</th>
              <th className="px-3 py-3">Verified By</th>
              <th className="px-3 py-3">Verified At</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={`${run.collectionName}-${run.id}`} className="shadow-[inset_0_-1px_0_#ebebeb]">
                <td className="px-3 py-3 font-mono text-xs">{run.id}</td>
                <td className="px-3 py-3">{run.collectionName}</td>
                <td className="px-3 py-3">{run.verifiedBy || "Unknown"}</td>
                <td className="px-3 py-3">{normalizeTimestamp(run.verifiedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> : null}
    </Card>
  );
}

function RecentTableSkeleton() {
  return (
    <div className="mt-5 overflow-x-auto" aria-busy="true" aria-label="Loading">
      <table className="min-w-[640px] text-left text-sm">
        <thead>
          <tr className="shadow-[inset_0_-1px_0_#ebebeb]">
            {Array.from({ length: 4 }).map((_, index) => (
              <th key={index} className="px-3 py-3">
                <SkeletonBlock className="h-3 w-20 rounded-md" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="shadow-[inset_0_-1px_0_#ebebeb]">
              <td className="px-3 py-3"><SkeletonBlock className="h-3 w-28 rounded-md" /></td>
              <td className="px-3 py-3"><SkeletonBlock className="h-3 w-32 rounded-md" /></td>
              <td className="px-3 py-3"><SkeletonBlock className="h-3 w-24 rounded-md" /></td>
              <td className="px-3 py-3"><SkeletonBlock className="h-3 w-36 rounded-md" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
