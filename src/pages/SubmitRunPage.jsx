import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addDoc, collection, endAt, getDocs, limit, orderBy, query, startAt, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { boardTypes, getCollectionName, getTrack, moons, versions } from "@/lib/boards";
import { DatePicker } from "@/components/DatePicker";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  boardType: "hq",
  quotaAmount: "",
  quotaFulfilled: "",
  quotaReached: "",
  totalScrap: "",
  moon: "41-Experimentation",
  scrapType: "Regular",
  equipment: "Company Cruiser",
  date: "",
  version: "v81",
  logs: "",
  spreadsheet: "",
  publicComments: "",
  comments: "",
  players: [{ name: "", videos: [""] }]
};

const equipmentOptions = ["Company Cruiser", "Jetpack", "TZP", "Shovel", "Miscellaneous", "None"];
const maxPlayers = 4;
const maxVideosPerPlayer = 10;

export function SubmitRunPage() {
  const params = useParams();
  const auth = useAuth();
  const trackId = params.track === "modded" ? "modded" : "vanilla";
  const track = getTrack(trackId);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const [selectedUsers, setSelectedUsers] = useState({});
  const board = boardTypes[form.boardType];

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updatePlayer = (index, value) => {
    setForm((current) => ({
      ...current,
      players: current.players.map((player, playerIndex) => playerIndex === index ? { ...player, name: value } : player)
    }));
    setSelectedUsers((current) => ({ ...current, [index]: null }));
  };
  const updateVideo = (playerIndex, videoIndex, value) => {
    setForm((current) => ({
      ...current,
      players: current.players.map((player, index) => index === playerIndex
        ? { ...player, videos: player.videos.map((video, nextVideoIndex) => nextVideoIndex === videoIndex ? value : video) }
        : player)
    }));
  };
  const addPlayer = () => {
    setForm((current) => current.players.length >= maxPlayers
      ? current
      : { ...current, players: [...current.players, { name: "", videos: [""] }] });
  };
  const removePlayer = (index) => {
    setForm((current) => ({
      ...current,
      players: current.players.filter((_, playerIndex) => playerIndex !== index)
    }));
    setSuggestions((current) => removeIndexedValue(current, index));
    setSelectedUsers((current) => removeIndexedValue(current, index));
  };
  const addVideo = (playerIndex) => {
    setForm((current) => ({
      ...current,
      players: current.players.map((player, index) => index === playerIndex && player.videos.length < maxVideosPerPlayer
        ? { ...player, videos: [...player.videos, ""] }
        : player)
    }));
  };
  const removeVideo = (playerIndex, videoIndex) => {
    setForm((current) => ({
      ...current,
      players: current.players.map((player, index) => index === playerIndex
        ? { ...player, videos: player.videos.filter((_, nextVideoIndex) => nextVideoIndex !== videoIndex) }
        : player)
    }));
  };

  useEffect(() => {
    if (!auth.loading && auth.username) {
      setForm((current) => ({
        ...current,
        players: current.players.map((player, index) => index === 0 && !player.name ? { ...player, name: auth.username } : player)
      }));
      if (auth.profile) setSelectedUsers((current) => ({ ...current, 0: auth.profile }));
    }
  }, [auth.loading, auth.profile, auth.username]);

  useEffect(() => {
    const timers = [];
    form.players.forEach((player, index) => {
      const searchTerm = player.name.trim().toLowerCase();
      if (searchTerm.length < 3 || selectedUsers[index]?.username === player.name.trim()) {
        setSuggestions((current) => ({ ...current, [index]: [] }));
        return;
      }

      const timer = setTimeout(async () => {
        try {
          const usersRef = collection(db, "users");
          const usersQuery = query(
            usersRef,
            orderBy("usernameLower"),
            startAt(searchTerm),
            endAt(`${searchTerm}\uf8ff`),
            limit(10)
          );
          const snapshot = await getDocs(usersQuery);
          const nextSuggestions = snapshot.docs.map((docSnapshot) => docSnapshot.data());
          setSuggestions((current) => ({ ...current, [index]: nextSuggestions }));
        } catch (error) {
          console.error("Error matching usernames:", error);
          setSuggestions((current) => ({ ...current, [index]: [] }));
        }
      }, 350);
      timers.push(timer);
    });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [form.players, selectedUsers]);

  useEffect(() => {
    function closeSuggestions(event) {
      if (event.key === "Escape") setSuggestions({});
    }
    document.addEventListener("keydown", closeSuggestions);
    return () => document.removeEventListener("keydown", closeSuggestions);
  }, []);

  function selectUser(playerIndex, user) {
    updatePlayer(playerIndex, user.username);
    setSelectedUsers((current) => ({ ...current, [playerIndex]: user }));
    setSuggestions((current) => ({ ...current, [playerIndex]: [] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Submitting...");

    const players = form.players.map((player) => player.name.trim()).filter(Boolean);
    if (players.length === 0) {
      setStatus("Add at least one player.");
      return;
    }
    if (!form.date) {
      setStatus("Select a run date.");
      return;
    }
    if (new Set(players.map((player) => player.toLowerCase())).size !== players.length) {
      setStatus("You cannot use the same player multiple times.");
      return;
    }
    if (Number(form.quotaReached || 0) >= 100) {
      setStatus("Number of quotas reached must be lower than 100.");
      return;
    }

    const videos = {};
    form.players.forEach((player) => {
      const name = player.name.trim();
      if (!name) return;
      const urls = player.videos
        .flatMap((video) => video.split(","))
        .map((url) => url.trim())
        .filter(Boolean);
      if (urls.length) videos[name] = urls;
    });
    const missingVideos = players.some((player) => !videos[player]?.length);
    if (missingVideos) {
      setStatus("Add at least one video link for each player.");
      return;
    }

    const payload = {
      players,
      videos,
      version: form.version,
      logs: form.logs,
      spreadsheet: form.spreadsheet,
      publicComments: form.publicComments,
      comments: form.comments,
      unrestricted: false,
      verified: false,
      verificationProgress: 0,
      submitter: auth.username || "",
      submissionDate: Timestamp.now(),
      date: form.date ? Timestamp.fromDate(new Date(form.date)) : Timestamp.now()
    };

    if (form.boardType === "hq" || form.boardType === "smhq") {
      payload.quotaAmount = Number(form.quotaAmount || 0);
      payload.quotaFulfilled = Number(form.quotaFulfilled || 0);
      payload.quotaReached = Number(form.quotaReached || 0);
      payload.totalScrap = Number(form.totalScrap || 0);
    }
    if (form.boardType === "sdc") {
      payload.totalScrap = Number(form.totalScrap || 0);
      payload.scrapType = form.scrapType;
      payload.equipment = [form.equipment];
    }
    if (form.boardType === "sdc" || form.boardType === "smhq") {
      payload.moon = form.moon;
    }

    try {
      await addDoc(collection(db, getCollectionName(trackId, form.boardType)), payload);
      setStatus("Run submitted for verification.");
      setForm({
        ...emptyForm,
        players: [{ name: auth.username || "", videos: [""] }]
      });
    } catch (error) {
      console.error(error);
      setStatus("Failed to submit run.");
    }
  }

  return (
    <section className="section-shell">
      <PageHeader eyebrow={track.shortName} title={`Submit ${track.name} Run`}>
        Board-specific fields are shown in one React form, then written to the existing Firebase collections.
      </PageHeader>

      <Card className="mx-auto max-w-3xl p-5">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Leaderboard type</Label>
            <Select value={form.boardType} onValueChange={(value) => update("boardType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              {Object.values(boardTypes).map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 rounded-lg bg-[#fafafa] p-4 shadow-border">
            <p className="text-sm font-semibold text-[#171717]">{board.name} metrics</p>
            {(form.boardType === "hq" || form.boardType === "smhq") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Quota amount"><Input type="number" value={form.quotaAmount} onChange={(event) => update("quotaAmount", event.target.value)} /></Field>
                <Field label="Quota fulfilled"><Input type="number" value={form.quotaFulfilled} onChange={(event) => update("quotaFulfilled", event.target.value)} /></Field>
                <Field label="Quota reached"><Input type="number" value={form.quotaReached} onChange={(event) => update("quotaReached", event.target.value)} /></Field>
                <Field label="Total scrap"><Input type="number" value={form.totalScrap} onChange={(event) => update("totalScrap", event.target.value)} /></Field>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Field label="Equipment">
                  <Select value={form.equipment} onValueChange={(value) => update("equipment", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-xs leading-5 text-[#666]">Choose the highest equipment used: Cruiser, Jetpack, TZP, Shovel, Miscellaneous, then None.</span>
                </Field>
              </div>
            )}
            {(form.boardType === "sdc" || form.boardType === "smhq") ? (
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date"><DatePicker value={form.date} onChange={(value) => update("date", value)} /></Field>
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

          <div className="grid gap-4 rounded-lg bg-[#fafafa] p-4 shadow-border">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#171717]">Players and videos</p>
              <Button type="button" variant="secondary" size="sm" onClick={addPlayer} disabled={form.players.length >= maxPlayers}>
                Add player
              </Button>
            </div>
            {form.players.map((player, playerIndex) => (
              <div className="grid gap-3 rounded-md bg-white p-3 shadow-border" key={playerIndex}>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <Field label={`Player ${playerIndex + 1}`}>
                    <PlayerSearchInput
                      value={player.name}
                      selectedUser={selectedUsers[playerIndex]}
                      suggestions={suggestions[playerIndex] || []}
                      onChange={(value) => updatePlayer(playerIndex, value)}
                      onSelect={(user) => selectUser(playerIndex, user)}
                      onClose={() => setSuggestions((current) => ({ ...current, [playerIndex]: [] }))}
                      required={playerIndex === 0}
                    />
                  </Field>
                  {playerIndex > 0 ? (
                    <Button type="button" variant="secondary" onClick={() => removePlayer(playerIndex)}>Remove</Button>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[#4d4d4d]">Videos</p>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addVideo(playerIndex)} disabled={player.videos.length >= maxVideosPerPlayer}>
                      Add video
                    </Button>
                  </div>
                  {player.videos.map((video, videoIndex) => (
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]" key={videoIndex}>
                      <Input type="url" value={video} onChange={(event) => updateVideo(playerIndex, videoIndex, event.target.value)} placeholder="https://video-link.com" />
                      {player.videos.length > 1 ? (
                        <Button type="button" variant="secondary" onClick={() => removeVideo(playerIndex, videoIndex)}>Remove</Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-[#666]">Up to 4 players and 10 videos per player.</p>
          </div>

          <div className="grid gap-4">
            <Field label="Logs"><Textarea value={form.logs} onChange={(event) => update("logs", event.target.value)} /></Field>
            <Field label="Spreadsheet"><Textarea value={form.spreadsheet} onChange={(event) => update("spreadsheet", event.target.value)} placeholder="Viewable spreadsheet link" /></Field>
            <Field label="Public comments"><Textarea value={form.publicComments} onChange={(event) => update("publicComments", event.target.value)} placeholder="Visible on profile and run details" /></Field>
            <Field label="Additional notes"><Textarea value={form.comments} onChange={(event) => update("comments", event.target.value)} placeholder="Verifier-only notes" /></Field>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Submit run</Button>
            {status ? <p className="text-sm text-[#4d4d4d]">{status}</p> : null}
          </div>
        </form>
      </Card>
    </section>
  );
}

function PlayerSearchInput({ value, selectedUser, suggestions, onChange, onSelect, onClose, required }) {
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="relative" onBlur={() => window.setTimeout(onClose, 150)}>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <Input value={value} onChange={(event) => onChange(event.target.value)} required={required} autoComplete="off" />
        {selectedUser?.profilePicture ? (
          <img src={selectedUser.profilePicture} alt="" className="h-10 w-10 rounded-full object-cover shadow-border" />
        ) : null}
      </div>
      {hasSuggestions ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-md bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.04),0_24px_32px_-8px_rgba(0,0,0,0.06),inset_0_0_0_1px_#ebebeb] dark:bg-black dark:shadow-[0_1px_1px_rgba(0,0,0,0.25),0_24px_48px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.16)]">
          {suggestions.map((user) => (
            <button
              key={user.username}
              type="button"
              className="focus-ring flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[#171717] hover:bg-[#fafafa] dark:text-white dark:hover:bg-[#0a0a0a]"
              onClick={() => onSelect(user)}
            >
              <img src={user.profilePicture || "/assets/default-avatar.png"} alt="" className="h-8 w-8 rounded-full object-cover" />
              <span className="font-medium">{user.username}</span>
            </button>
          ))}
          <button type="button" className="sr-only" onClick={onClose}>Close suggestions</button>
        </div>
      ) : null}
    </div>
  );
}

function removeIndexedValue(values, removedIndex) {
  return Object.entries(values).reduce((next, [key, value]) => {
    const numericKey = Number(key);
    if (numericKey < removedIndex) next[numericKey] = value;
    if (numericKey > removedIndex) next[numericKey - 1] = value;
    return next;
  }, {});
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#4d4d4d]">{label}</span>
      {children}
    </label>
  );
}
