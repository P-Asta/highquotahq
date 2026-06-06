import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const manifests = [
  ["v40", "8596342981027780916"],
  ["v45", "7637156099460715726"],
  ["v49", "7525563530173177311"],
  ["v50", "2961956797830002840"],
  ["v56", "6648293528411358330"],
  ["v62", "2681997312468718444"],
  ["v64", "8158077314512521071"],
  ["v69", "1367019593609280205"],
  ["v72", "4861510547912001926"],
  ["v73", "1749099131234587692"],
  ["v81", "6423525044216269478"]
];

const modpackCodes = [
  ["v40", "019e045e-e202-c5bf-897a-fc185ea8a1dd"],
  ["v45-v49", "019e045f-041e-0689-7040-3c74e2de6ef1"],
  ["v50", "019e045f-2ff3-34df-81c3-eb31135e3bd8"],
  ["v56", "019e045f-4e0e-8c75-51a4-54ab5acdc42b"],
  ["v62", "019e0458-1e2d-717e-ac3f-725cfba3691b"],
  ["v64-v72", "019e045f-9246-59b1-a74a-71d860a435e8"],
  ["v73", "019e045f-e119-03d5-210e-8f52c73b600a"],
  ["v81", "019e3b77-5cd9-0ed2-7fd6-cbb7bfbfaf55"]
];

const savefiles = [
  ["80% Jetpack, 80% Cruiser, 80% TZP, 30% Shovel", "Disco ball, Jack-o-Lantern", "LCSaveFile_80Jet_80Cru_80Tzp_30Sho_Disco_Jack"],
  ["80% Jetpack, 80% Cruiser, 80% TZP", "Disco ball, Television, Fridge", "LCSaveFile_80Jet_80Cru_80Tzp_Disco_Tele_Fridge"],
  ["80% Jetpack, 80% Cruiser, 80% Weed Killer, 70% TZP", "Disco ball", "LCSaveFile_80Jet_80Cru_80Weed_70Tzp_Disco"],
  ["80% Jetpack, 80% Shovel, 80% Weed Killer, 30% Flashlight", "Disco ball, Television, Jack-o-Lantern, Shower", "LCSaveFile_80Sho_80Wee_80Jet_30Pickle_Disco_Tele_Jack_Shower"],
  ["80% Shovel, 80% Weed Killer, 70% Zap Gun", "Disco ball, Television, Jack-o-Lantern, Record player", "LCSaveFile_80Sho_80Wee_70Zap_Disco_Tele_Jack_Record"],
  ["80% Shovel, 80% Weed Killer, 70% Zap Gun", "Disco ball, Television, Jack-o-Lantern, Plushie pajama man, Table", "LCSaveFile_80Sho_80Wee_70Zap_Disco_Tele_Jack_Plush_Table"],
  ["80% Shovel, 80% Weed Killer, 50% Spray Paint", "Disco ball, Television, Jack-o-Lantern, Sofa chair", "LCSaveFile_80Sho_80Wee_50Spray_Disco_Tele_Jack_Sofa"],
  ["80% Shovel, 80% Weed Killer, 20% Zap Gun", "Disco ball, Television, Jack-o-Lantern, Plushie pajama man, Dog house, Goldfish", "LCSaveFile_80Sho_80Wee_20Zap_Disco_Tele_Jack_Plush_DogHouse_Goldfish"],
  ["80% Jetpack, 80% Cruiser, 80% Pro-Flashlight, 50% Walkie-Talkie", "Disco ball", "LCSaveFile_80Jet_80Cru_80Pro_50Walk_Disco"],
  ["80% Jetpack, 70% Flashlight, 60% Walkie-Talkie", "Disco ball, Television, Jack-o-Lantern, Shower", "LCSaveFile_70Flash_60Walki_80Jet_Disco_Tele_Shower_Jack"]
];

const guides = [
  {
    title: "Downpatch Guide",
    body: (
      <>
        <p className="text-[#4d4d4d]">
          Before manually downpatching, consider using <a className="font-medium text-[#0072f5] hover:underline" href="https://asta.rs/hq-launcher/" target="_blank" rel="noreferrer">HQLauncher</a> for automatic downloads of approved packs and older Lethal Company versions.
        </p>
        <p className="mt-3 text-[#4d4d4d]">Original guide by CookiesUnite. Use the manifest ID for the version you want to download.</p>
        <DataTable headers={["Version", "Manifest ID"]} rows={manifests} />
        <p className="mt-4 text-sm text-[#666]">Thanks to @OkiaBetter, @Tomatobird8, @Escue, and @1A3Dev for their contributions.</p>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-[#4d4d4d]">
          <li>Press <kbd className="rounded bg-white px-1 font-mono shadow-border">Windows + R</kbd>.</li>
          <li>Enter <code className="rounded bg-white px-1 font-mono shadow-border">steam://open/console</code>.</li>
          <li>Run <code className="rounded bg-white px-1 font-mono shadow-border">download_depot 1966720 1966721 &lt;manifestID&gt;</code>.</li>
          <li>Wait for the download to complete.</li>
          <li>Find the files under <code className="rounded bg-white px-1 font-mono shadow-border">Steam &gt; steamapps &gt; content &gt; app_1966720 &gt; depot_1966721</code>.</li>
          <li>Move downloaded files before downloading another version.</li>
        </ol>
        <p className="mt-5 text-[#4d4d4d]">
          Visual guide: <a className="font-medium text-[#0072f5] hover:underline" href="https://youtu.be/bkIBBsLDbIA?si=v6_lDQ49mTPR2Quk" target="_blank" rel="noreferrer">watch the tutorial</a>.
        </p>
      </>
    )
  },
  {
    title: "Modpack Codes",
    body: (
      <>
        <p className="text-[#4d4d4d]">Thunderstore profile codes for available versions of the allowed modpack.</p>
        <p className="mt-3 text-[#4d4d4d]">Never update any mods other than Vlog, HQoL, and the respective HQModules.</p>
        <DataTable headers={["Version", "Profile code"]} rows={modpackCodes} monoSecond />
      </>
    )
  },
  {
    title: "Favorable Savefiles",
    body: (
      <>
        <h3 className="text-xl font-semibold text-[#171717]">Savefiles with good furniture, sales, and weather</h3>
        <p className="mt-2 text-[#4d4d4d]">These savefiles are meant for v81. Copy a file into your saves folder and rename it to <code className="rounded bg-white px-1 font-mono shadow-border">LCSaveFile#</code>.</p>
        <DataTable
          headers={["Sales", "Furniture", "Link"]}
          rows={savefiles.map(([sales, furniture, file]) => [
            sales,
            furniture,
            <a className="font-medium text-[#0072f5] hover:underline" href={`/lethal-company/download/${file}`} download={file} target="_blank" rel="noreferrer">Download</a>
          ])}
        />
      </>
    )
  },
  {
    title: "Stamina Guide",
    body: (
      <>
        <p className="text-[#4d4d4d]">Original guide by MakuAureo. Good stamina management preserves acceleration and leaves reserve stamina for unexpected threats.</p>
        <GuideSection title="Stamina Basics" items={[
          "Stamina depletes only when running or jumping.",
          "Jumping uses stamina but does not increase horizontal speed.",
          "More weight means slower movement and faster stamina depletion.",
          "Stamina regenerates at the same rate regardless of weight.",
          "Walking slows down stamina regeneration.",
          "Taking damage increases stamina proportional to the damage taken."
        ]} />
        <GuideSection title="Basic Strategies" items={[
          "Do not jump unless necessary.",
          "Stand still while waiting for stamina to regenerate.",
          "Avoid letting stamina completely fill up.",
          "Running is more efficient with less weight.",
          "Run down slopes and walk up slopes."
        ]} />
        <GuideSection title="Advanced Usage" items={[
          "Running accelerates over time instead of instantly reaching max speed.",
          "Use single sprint bursts to reduce acceleration time loss.",
          "Acceleration resets after walking or crouching."
        ]} />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["/assets/walkdrop.gif", "Walk drop"],
            ["/assets/rundrop.gif", "Run drop"],
            ["/assets/walkflick.gif", "Walk flick"],
            ["/assets/doublewalkflick.gif", "Double walk flick"]
          ].map(([src, label]) => (
            <div key={label} className="rounded-lg bg-white p-3 shadow-border">
              <img src={src} alt={label} className="aspect-video w-full rounded-md object-cover" />
              <p className="mt-2 text-sm font-medium text-[#171717]">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-2 text-[#4d4d4d]">
          <a className="font-medium text-[#0072f5] hover:underline" href="https://www.youtube.com/watch?v=R00IojS7ekk" target="_blank" rel="noreferrer">Thalonius' Momentum Preservation Guide</a>
          <a className="font-medium text-[#0072f5] hover:underline" href="https://www.youtube.com/watch?v=XwCTajRoSk4" target="_blank" rel="noreferrer">Bread's Looting Efficiency Guide</a>
        </div>
      </>
    )
  },
  {
    title: "Wafrody HQ Guides",
    body: (
      <>
        <p className="text-[#4d4d4d]">Wafrody's video guides include useful statistics and detailed strategies for surviving while maximizing profit.</p>
        <LinkList links={[
          ["Artifice Guide for High Quota", "https://youtu.be/52sV9svUozc"],
          ["Old Adamance guide for High Quota [V50..V73]", "https://youtu.be/1qaczbNzBOA"],
          ["Old Facility Guide for High Quota [v40 to v73]", "https://youtu.be/R9jlo-BdBXg"],
          ["Old Mansion Guide for High Quota [V40 to v69]", "https://youtu.be/Ti5PpwGTs3Y"]
        ]} />
      </>
    )
  },
  {
    title: "Bread HQ Guide",
    body: (
      <p className="text-[#4d4d4d]">
        Watch Bread's high quota breakdown on YouTube: <a className="font-medium text-[#0072f5] hover:underline" href="https://www.youtube.com/watch?v=of8AeXeWcFI" target="_blank" rel="noreferrer">open the video</a>.
      </p>
    )
  },
  {
    title: "Reference Sheets",
    body: (
      <>
        <p className="text-[#4d4d4d]">Spreadsheet references for modded moon data and route planning.</p>
        <LinkList links={[
          ["Wesley's Mega Sheet", "https://docs.google.com/spreadsheets/d/1ZfxhnaxQsv4ss9UCHQK-4cFF-B1BbETMGgwpUN3MOG4/edit"],
          ["Wesley's Moons Data", "https://docs.google.com/spreadsheets/d/1181PHcKgOX0HECueFeJy3Aqoi0qKNq8y19lBZcJfaIs/edit?usp=sharing"],
          ["Classic Moons Data", "https://docs.google.com/spreadsheets/d/1OhyFiWD9guIhgSzhFEmaw6kLw5tundO4DG14mBH9izA/edit?usp=sharing"]
        ]} />
      </>
    )
  }
];

export function GuidesPage() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section-shell">
      <PageHeader eyebrow="guides" title="Guides">
        Route references, downpatch notes, savefiles, modpack codes, and movement resources.
      </PageHeader>
      <div className="grid gap-3">
        {guides.map((guide, index) => (
          <Card key={guide.title} className="overflow-hidden">
            <button
              type="button"
              className="focus-ring flex min-h-14 w-full items-center justify-between gap-4 px-5 text-left text-base font-semibold text-[#171717] hover:bg-[#fafafa]"
              onClick={() => setOpen(open === index ? -1 : index)}
            >
              {guide.title}
              <ChevronDown className={cn("h-4 w-4 transition-transform", open === index && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {open === index ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div className="p-5 pt-0">{guide.body}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </section>
  );
}

function DataTable({ headers, rows, monoSecond = false }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg shadow-border">
      <table className="min-w-[560px] bg-white text-left text-sm">
        <thead className="text-xs uppercase text-[#666]">
          <tr className="shadow-[inset_0_-1px_0_#ebebeb]">
            {headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="shadow-[inset_0_-1px_0_#ebebeb]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cn("px-4 py-3 text-[#4d4d4d]", cellIndex === 0 && "font-medium text-[#171717]", monoSecond && cellIndex === 1 && "font-mono text-xs")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GuideSection({ title, items }) {
  return (
    <section className="mt-5">
      <h3 className="text-lg font-semibold text-[#171717]">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[#4d4d4d]">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

function LinkList({ links }) {
  return (
    <div className="mt-5 grid gap-3">
      {links.map(([label, href]) => (
        <a key={href} className="rounded-md bg-white px-3 py-3 text-sm font-medium text-[#0072f5] shadow-border hover:underline" href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      ))}
    </div>
  );
}
