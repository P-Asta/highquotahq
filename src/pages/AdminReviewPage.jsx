import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Save, ShieldCheck, Trash2 } from "lucide-react";
import { collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { allCollections, moons, normalizeTimestamp, versions } from "@/lib/boards";
import { DatePicker } from "@/components/DatePicker";
import { LoadingPanel } from "@/components/LoadingPanel";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const blankForm = {
  players: "",
  date: "",
  version: "v81",
  unrestricted: "false",
  claimedBy: "",
  logs: "",
  spreadsheet: "",
  publicComments: "",
  comments: "",
  verificationProgress: 0,
  quotaAmount: "",
  quotaFulfilled: "",
  quotaReached: "",
  totalScrap: "",
  moon: "41-Experimentation",
  scrapType: "Regular",
  equipment: "",
  videos: {}
};

function toDateInput(value) {
  if (!value) return "";
  const date = typeof value.toDate === "function" ? value.toDate() : value.seconds ? new Date(value.seconds * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeVideos(videos, players = []) {
  const next = {};
  players.forEach((player) => {
    if (player) next[player] = [];
  });

  if (!videos || typeof videos !== "object") return next;

  Object.entries(videos).forEach(([player, urls]) => {
    const normalizedUrls = Array.isArray(urls)
      ? urls
      : String(urls || "").split(/[\n,]+/);
    next[player] = normalizedUrls.map((url) => String(url).trim()).filter(Boolean);
  });

  return next;
}

function parsePlayerNames(value) {
  return value.split(",").map((player) => player.trim()).filter(Boolean);
}

function boardTypeFromCollection(collectionName) {
  if (collectionName.includes("sdc")) return "sdc";
  if (collectionName.includes("smhq")) return "smhq";
  return "hq";
}

export function AdminReviewPage() {
  const { type = "vanilla", collectionName = "", runId = "" } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [run, setRun] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState("");

  const boardType = useMemo(() => boardTypeFromCollection(collectionName), [collectionName]);
  const canReview = auth.roles.includes("site-developer") || auth.roles.includes("admin") || (type === "modded" ? auth.roles.includes("modded-verifier") : auth.roles.includes("verifier"));
  const isValidCollection = allCollections.includes(collectionName);

  async function loadRun() {
    if (!isValidCollection || !runId) {
      setStatus("Invalid review link.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const snapshot = await getDoc(doc(db, collectionName, runId));
      if (!snapshot.exists()) {
        setRun(null);
        setStatus("Run not found.");
        return;
      }

      const data = { id: snapshot.id, collectionName, ...snapshot.data() };
      setRun(data);
      setForm({
        players: (data.players || []).join(", "),
        date: toDateInput(data.date),
        version: data.version || "v81",
        unrestricted: data.unrestricted ? "true" : "false",
        claimedBy: data.claimedBy || "",
        logs: data.logs || "",
        spreadsheet: data.spreadsheet || "",
        publicComments: data.publicComments || "",
        comments: data.comments || "",
        verificationProgress: Number(data.verificationProgress || 0),
        quotaAmount: data.quotaAmount ?? "",
        quotaFulfilled: data.quotaFulfilled ?? "",
        quotaReached: data.quotaReached ?? "",
        totalScrap: data.totalScrap ?? "",
        moon: data.moon || "41-Experimentation",
        scrapType: data.scrapType || "Regular",
        equipment: Array.isArray(data.equipment) ? data.equipment.join(", ") : data.equipment || "",
        videos: normalizeVideos(data.videos, data.players || [])
      });
      setStatus("");
    } catch (error) {
      console.error(error);
      setStatus("Could not load run.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRun();
  }, [collectionName, runId]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateVideoUrls = (player, value) => {
    setForm((current) => ({
      ...current,
      videos: {
        ...current.videos,
        [player]: value.split(/[\n,]+/).map((url) => url.trim()).filter(Boolean)
      }
    }));
  };

  async function saveRun() {
    if (!run) return;
    setBusy("save");
    setStatus("Saving run changes...");
    const players = parsePlayerNames(form.players);

    const payload = {
      players,
      version: form.version,
      unrestricted: form.unrestricted === "true",
      claimedBy: form.claimedBy.trim() || null,
      logs: form.logs,
      spreadsheet: form.spreadsheet,
      publicComments: form.publicComments,
      comments: form.comments,
      verificationProgress: Number(form.verificationProgress || 0),
      videos: normalizeVideos(form.videos, players)
    };

    if (form.date) payload.date = Timestamp.fromDate(new Date(form.date));
    if (boardType === "hq" || boardType === "smhq") {
      payload.quotaAmount = Number(form.quotaAmount || 0);
      payload.quotaFulfilled = Number(form.quotaFulfilled || 0);
      payload.quotaReached = Number(form.quotaReached || 0);
      payload.totalScrap = Number(form.totalScrap || 0);
    }
    if (boardType === "sdc") {
      payload.totalScrap = Number(form.totalScrap || 0);
      payload.scrapType = form.scrapType;
      payload.equipment = form.equipment;
    }
    if (boardType === "sdc" || boardType === "smhq") payload.moon = form.moon;

    try {
      await updateDoc(doc(db, collectionName, runId), payload);
      setStatus("Saved changes.");
      await loadRun();
    } catch (error) {
      console.error(error);
      setStatus("Save failed.");
    } finally {
      setBusy("");
    }
  }

  async function claimRun() {
    setBusy("claim");
    setStatus("Claiming run...");
    try {
      await updateDoc(doc(db, collectionName, runId), {
        claimedBy: auth.username,
        claimedAt: new Date()
      });
      setStatus("Run claimed.");
      await loadRun();
    } catch (error) {
      console.error(error);
      setStatus("Claim failed.");
    } finally {
      setBusy("");
    }
  }

  async function saveProgress() {
    setBusy("progress");
    setStatus("Updating verification progress...");
    try {
      await updateDoc(doc(db, collectionName, runId), {
        verificationProgress: Number(form.verificationProgress || 0)
      });
      setStatus("Verification progress updated.");
      await loadRun();
    } catch (error) {
      console.error(error);
      setStatus("Progress update failed.");
    } finally {
      setBusy("");
    }
  }

  async function verifyRun() {
    if (!run) return;
    setBusy("verify");
    setStatus("Verifying run...");

    try {
      const batch = writeBatch(db);
      const runRef = doc(db, collectionName, runId);
      batch.update(runRef, {
        verified: true,
        verifiedBy: auth.username,
        verifiedAt: new Date()
      });

      try {
        const obsolete = await getDocs(query(collection(db, collectionName), where("players", "==", run.players || []), where("version", "==", run.version || "")));
        obsolete.forEach((obsoleteDoc) => {
          if (obsoleteDoc.id !== runId) batch.delete(doc(db, collectionName, obsoleteDoc.id));
        });
      } catch {
        setStatus("Verifying run... skipped obsolete-run cleanup because Firestore index is unavailable.");
      }

      await batch.commit();
      setStatus("Verified. Returning to queue...");
      setTimeout(() => navigate("/admin"), 650);
    } catch (error) {
      console.error(error);
      setStatus("Verify failed.");
      setBusy("");
    }
  }

  async function rejectRun() {
    setBusy("reject");
    setStatus("Rejecting run...");
    try {
      await deleteDoc(doc(db, collectionName, runId));
      setStatus("Rejected. Returning to queue...");
      setTimeout(() => navigate("/admin"), 650);
    } catch (error) {
      console.error(error);
      setStatus("Reject failed.");
      setBusy("");
    }
  }

  if (auth.loading || loading) {
    return <section className="section-shell"><LoadingPanel variant="review" /></section>;
  }

  if (!auth.user || !canReview) {
    return <section className="section-shell"><Card className="p-5 text-[#4d4d4d]">Review access required.</Card></section>;
  }

  return (
    <section className="section-shell">
      <PageHeader
        eyebrow="review"
        title="Verify Run"
        action={
          <Button asChild variant="secondary">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
              Back to queue
            </Link>
          </Button>
        }
      >
        Dedicated review page for editing evidence, tracking progress, and approving or rejecting the submission.
      </PageHeader>

      {status ? (
        <div className="mb-4 rounded-lg bg-[#fafafa] p-4 text-sm font-medium text-[#4d4d4d] shadow-border dark:bg-black dark:text-white">
          {busy ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 inline h-4 w-4" />}
          {status}
        </div>
      ) : null}

      {!run ? (
        <Card className="p-5 text-[#4d4d4d]">Run not found.</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge>{collectionName}</Badge>
                <h2 className="mt-4 text-2xl font-semibold text-[#171717]">Run Information</h2>
              </div>
              <Badge>{run.verified ? "verified" : "pending"}</Badge>
            </div>

            <div className="mt-5 grid gap-4">
              <Field label="Players">
                <Input value={form.players} onChange={(event) => update("players", event.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <DatePicker value={form.date} onChange={(value) => update("date", value)} />
                </Field>
                <Field label="Version">
                  <Select value={form.version} onValueChange={(value) => update("version", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((version) => <SelectItem key={version} value={version}>{version}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Claimed by">
                  <Input value={form.claimedBy} onChange={(event) => update("claimedBy", event.target.value)} />
                </Field>
                <Field label="Unrestricted">
                  <Select value={form.unrestricted} onValueChange={(value) => update("unrestricted", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="rounded-lg bg-[#fafafa] p-4 shadow-border dark:bg-black">
                <p className="mb-4 text-sm font-semibold text-[#171717]">Board Metrics</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(boardType === "hq" || boardType === "smhq") ? (
                    <>
                      <Field label="Quota amount"><Input type="number" value={form.quotaAmount} onChange={(event) => update("quotaAmount", event.target.value)} /></Field>
                      <Field label="Quota fulfilled"><Input type="number" value={form.quotaFulfilled} onChange={(event) => update("quotaFulfilled", event.target.value)} /></Field>
                      <Field label="Quota reached"><Input type="number" value={form.quotaReached} onChange={(event) => update("quotaReached", event.target.value)} /></Field>
                      <Field label="Total scrap"><Input type="number" value={form.totalScrap} onChange={(event) => update("totalScrap", event.target.value)} /></Field>
                    </>
                  ) : (
                    <>
                      <Field label="Total scrap"><Input type="number" value={form.totalScrap} onChange={(event) => update("totalScrap", event.target.value)} /></Field>
                      <Field label="Scrap type">
                        <Select value={form.scrapType} onValueChange={(value) => update("scrapType", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="Single">Single</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Equipment"><Textarea value={form.equipment} onChange={(event) => update("equipment", event.target.value)} /></Field>
                    </>
                  )}
                  {(boardType === "sdc" || boardType === "smhq") ? (
                    <Field label="Moon">
                      <Select value={form.moon} onValueChange={(value) => update("moon", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {moons.map((moon) => <SelectItem key={moon} value={moon}>{moon}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  ) : null}
                </div>
              </div>

              <Field label="Logs">
                <Textarea value={form.logs} onChange={(event) => update("logs", event.target.value)} />
              </Field>
              <Field label="Spreadsheet">
                <Textarea value={form.spreadsheet} onChange={(event) => update("spreadsheet", event.target.value)} />
              </Field>
              <Field label="Public comments">
                <Textarea value={form.publicComments} onChange={(event) => update("publicComments", event.target.value)} />
              </Field>
              <Field label="Verifier notes">
                <Textarea value={form.comments} onChange={(event) => update("comments", event.target.value)} />
              </Field>
              <VideoLinksEditor
                players={parsePlayerNames(form.players)}
                videos={form.videos}
                onChange={updateVideoUrls}
              />
            </div>
          </Card>

          <aside className="grid content-start gap-4">
            <Card className="p-5">
              <h3 className="text-xl font-semibold text-[#171717]">Progress</h3>
              <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">Set how much of the submission has been reviewed.</p>
              <div className="mt-4">
                <Field label="Verification percent">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.verificationProgress}
                    onChange={(event) => update("verificationProgress", event.target.value)}
                  />
                </Field>
              </div>
              <Button className="mt-4 w-full" variant="secondary" onClick={saveProgress} disabled={!!busy}>
                Update Progress
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="text-xl font-semibold text-[#171717]">Actions</h3>
              <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">Save edits before verifying if you changed evidence or metrics.</p>
              <div className="mt-5 grid gap-2">
                <Button onClick={saveRun} disabled={!!busy}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                {!run.claimedBy ? (
                  <Button variant="secondary" onClick={claimRun} disabled={!!busy}>
                    Claim Run
                  </Button>
                ) : null}
                <Button onClick={verifyRun} disabled={!!busy}>
                  <ShieldCheck className="h-4 w-4" />
                  Verify
                </Button>
                <Button variant="secondary" onClick={rejectRun} disabled={!!busy}>
                  <Trash2 className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-xl font-semibold text-[#171717]">Audit</h3>
              <dl className="mt-4 grid gap-3 text-sm">
                <Detail label="Run ID" value={runId} mono />
                <Detail label="Submitted date" value={normalizeTimestamp(run.date)} />
                <Detail label="Claimed by" value={run.claimedBy || "Unclaimed"} />
                <Detail label="Verified by" value={run.verifiedBy || "N/A"} />
              </dl>
            </Card>
          </aside>
        </div>
      )}
    </section>
  );
}

function VideoLinksEditor({ players, videos, onChange }) {
  return (
    <section className="grid gap-4 rounded-lg bg-[#fafafa] p-4 shadow-border dark:bg-black">
      <div>
        <h3 className="text-sm font-semibold text-[#171717]">Video Links</h3>
        <p className="mt-1 text-xs leading-5 text-[#666]">Edit one player's video links per line or separate multiple links with commas.</p>
      </div>
      {players.length === 0 ? (
        <p className="text-sm text-[#4d4d4d]">Add players above to edit video links.</p>
      ) : (
        <div className="grid gap-4">
          {players.map((player) => {
            const urls = videos[player] || [];
            return (
              <div key={player} className="grid gap-2">
                <p className="text-sm font-semibold text-[#171717]">{player}</p>
                <Input
                  value={urls.join(", ")}
                  onChange={(event) => onChange(player, event.target.value)}
                  placeholder="https://www.twitch.tv/videos/..."
                />
                {urls.length > 0 ? (
                  <div className="grid gap-1">
                    {urls.map((url, index) => (
                      <a
                        key={`${url}-${index}`}
                        className="break-all font-mono text-sm font-semibold text-[#171717] hover:text-[#0072f5] hover:underline"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#4d4d4d]">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="rounded-md bg-[#fafafa] p-3 shadow-border dark:bg-black">
      <dt className="text-xs font-semibold uppercase text-[#666]">{label}</dt>
      <dd className={`mt-1 text-[#171717] ${mono ? "font-mono text-xs" : "text-sm font-medium"}`}>{value}</dd>
    </div>
  );
}
