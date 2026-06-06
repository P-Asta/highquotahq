import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "main", label: "Main Rules" },
  { id: "category", label: "Category Rules" },
  { id: "community", label: "Community Guidelines" }
];

export function RulesPage() {
  const [tab, setTab] = useState("main");

  return (
    <section className="section-shell">
      <PageHeader eyebrow="rules" title="Rules">
        Verification, gameplay, category, and community rules for leaderboard submissions.
      </PageHeader>

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "focus-ring h-9 rounded-md px-3 text-sm font-medium shadow-[0_0_0_1px_rgb(235,235,235)]",
                tab === item.id ? "bg-[#171717] text-white shadow-none dark:bg-white dark:text-black" : "bg-white text-[#171717] hover:bg-[#fafafa]"
              )}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        {tab === "main" ? <MainRules /> : null}
        {tab === "category" ? <CategoryRules /> : null}
        {tab === "community" ? <CommunityGuidelines /> : null}
      </Card>
    </section>
  );
}

function MainRules() {
  return (
    <div className="rules-copy">
      <RuleSection title="Verification Rules">
        <li>Videos must be permanent.</li>
        <li>Solo and Duo runs require full recordings from every player.</li>
        <li>For Trio and Squad runs, one non-host runner may be exempt from recording if the reason is strong.</li>
        <li>Video must start at the main menu with the version number visible.</li>
        <li>Video must include in-game audio.</li>
        <li>If playing with allowed mods, the session code must be visible at all times.</li>
        <li>All player log files must be saved from each session and submitted if requested by a verifier.</li>
        <li>Runs over four sessions are less likely to be accepted.</li>
      </RuleSection>

      <RuleSection title="Gameplay Rules">
        <li>Save scumming is not allowed.</li>
        <li>Getting information from outside your own point of view is not allowed.</li>
        <li>Talking to teammates outside the game during a run is not allowed.</li>
        <li>Orbit restarts are reserved for unplayable game states or disconnects.</li>
        <li>Copying a preset save file is allowed if it has no days played.</li>
        <li>Out-of-bounds clipping is allowed only to reach otherwise unreachable items or return to main entrance.</li>
      </RuleSection>

      <RuleSection title="Banned Exploits">
        <li>Time freeze, including holding the game window.</li>
        <li>Speed glitch, negative weight, weather rerolling, and multi-terminal.</li>
        <li>Cruiser vaulting and gift box manipulation.</li>
      </RuleSection>

      <RuleSection title="Run Disqualifications">
        <li>Breaking verification, gameplay, or community rules.</li>
        <li>Using banned exploits.</li>
        <li>Account impersonation, alternate accounts, or submissions with banned players.</li>
        <li>Falsified or cheated runs.</li>
      </RuleSection>
    </div>
  );
}

function CategoryRules() {
  return (
    <div className="rules-copy">
      <RuleSection title="Classic High Quota">
        <li>All main rules apply.</li>
      </RuleSection>

      <RuleSection title="Single Moon High Quota">
        <li>All main rules apply.</li>
        <li>You must stay on the same moon throughout the run.</li>
      </RuleSection>

      <RuleSection title="Single Day Clear">
        <li>Video proof must start from the main menu with the version number visible.</li>
        <li>Video may only end after the final Scrap Collected screen has fully displayed.</li>
        <li>Player logs are only required from the session where the SDC occurred.</li>
        <li>You may quit your save at any time to avoid losing gear.</li>
      </RuleSection>

      <RuleSection title="Modded Categories">
        <li>Brutal Company runs cannot use terminal commands provided by Brutal Company Minus.</li>
        <li>Wesley's Moons and Classic Moons runs cannot land on vanilla moons, except the Company Moon.</li>
        <li>For Wesley's Moons v73+, WeatherRegistry must use Hybrid weather and first day clear.</li>
      </RuleSection>
    </div>
  );
}

function CommunityGuidelines() {
  return (
    <div className="rules-copy">
      <RuleSection title="Be Respectful">
        <li>Interactions should not be abusive or create an unwelcoming environment.</li>
        <li>Do not rank or put down other community members.</li>
      </RuleSection>

      <RuleSection title="No Offensive Language">
        <li>Personal attacks and harassment are not tolerated.</li>
        <li>Bigotry, ableism, discrimination, and sexual comments are not tolerated.</li>
      </RuleSection>

      <RuleSection title="Enforcement">
        <li>Breaking guidelines can result in warnings, bans, on-site bans, and removal of runs.</li>
      </RuleSection>
    </div>
  );
}

function RuleSection({ title, children }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="text-2xl font-semibold text-[#171717]">{title}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[#4d4d4d]">{children}</ul>
    </section>
  );
}
