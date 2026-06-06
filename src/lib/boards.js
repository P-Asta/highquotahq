export const tracks = {
  vanilla: {
    id: "vanilla",
    name: "Lethal Company",
    shortName: "Vanilla",
    logo: "/lethal-company-logo.png",
    accent: "#ff5b4f",
    collections: {
      hq: "leaderboards_hq",
      sdc: "leaderboards_sdc",
      smhq: "leaderboards_smhq"
    }
  },
  modded: {
    id: "modded",
    name: "Modded Company",
    shortName: "Modded",
    logo: "/lethal-company-modded-logo.png",
    accent: "#de1d8d",
    collections: {
      hq: "modded_hq",
      sdc: "modded_sdc",
      smhq: "modded_smhq"
    }
  }
};

export const boardTypes = {
  hq: {
    id: "hq",
    name: "Classic High Quota",
    metricLabel: "Quota Amount",
    metricKey: "quotaAmount"
  },
  sdc: {
    id: "sdc",
    name: "Single Day Clear",
    metricLabel: "Total Scrap",
    metricKey: "totalScrap"
  },
  smhq: {
    id: "smhq",
    name: "Single Moon High Quota",
    metricLabel: "Quota Amount",
    metricKey: "quotaAmount"
  }
};

export const versions = ["v40", "v45", "v49", "v50", "v56", "v62", "v64", "v69", "v72", "v73", "v81"];

export const moons = [
  "41-Experimentation",
  "220-Assurance",
  "56-Vow",
  "21-Offense",
  "61-March",
  "20-Adamance",
  "85-Rend",
  "7-Dine",
  "8-Titan",
  "68-Artifice",
  "5-Embrion"
];

export const allCollections = [
  "leaderboards_hq",
  "leaderboards_sdc",
  "leaderboards_smhq",
  "modded_hq",
  "modded_sdc",
  "modded_smhq"
];

export function getTrack(trackId) {
  return tracks[trackId] || tracks.vanilla;
}

export function getCollectionName(trackId, boardType) {
  return getTrack(trackId).collections[boardType] || getTrack(trackId).collections.hq;
}

export function getRunValue(run, boardType) {
  const key = boardTypes[boardType]?.metricKey || "quotaAmount";
  return Number(run?.[key] || 0);
}

export function normalizeTimestamp(value) {
  if (!value) return "N/A";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  if (typeof value === "string") return value;
  if (value.seconds) return new Date(value.seconds * 1000).toLocaleString();
  return "N/A";
}
