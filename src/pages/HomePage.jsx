import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, ShieldCheck, Trophy, UploadCloud, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    title: "Lethal Company",
    label: "Vanilla boards",
    href: "/leaderboards/vanilla",
    logo: "/lethal-company-logo.png",
    copy: "Classic High Quota, Single Day Clear, and Single Moon boards for unmodded runs."
  },
  {
    title: "Modded Company",
    label: "Modded boards",
    href: "/leaderboards/modded",
    logo: "/lethal-company-modded-logo.png",
    copy: "A separate verification track for modded high quota categories and evidence."
  },
  {
    title: "Submit a Run",
    label: "Verification flow",
    href: "/submit/vanilla",
    logo: "/high-quota-logo.png",
    copy: "Send players, videos, logs, version, comments, and board-specific metrics."
  }
];

const workflow = [
  ["develop", "Route the attempt", "Choose the track, category, moon, team size, and version before the run.", "#0a72ef"],
  ["preview", "Attach the proof", "Submit evidence in a structured form so verifiers can scan it quickly.", "#de1d8d"],
  ["ship", "Verify the record", "Approved runs become ranked entries with profile links and run details.", "#ff5b4f"]
];

export function HomePage() {
  return (
    <>
      <section className="container py-20 text-center md:py-28">
        <motion.img
          src="/high-quota-logo.png"
          alt="High Quota HQ"
          className="mx-auto h-20 w-20 object-contain"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Badge className="mt-8">community records</Badge>
          <h1 className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-bold leading-none tracking-normal text-[#171717] md:text-6xl">
            High Quota HQ
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#4d4d4d]">
            A React-built leaderboard home for Lethal Company challenge runners, verifiers, and teams pushing quota routes to their limit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/leaderboards/vanilla">
                <Trophy className="h-4 w-4" />
                View leaderboards
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/submit/vanilla">
                <UploadCloud className="h-4 w-4" />
                Submit a run
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-lg bg-white shadow-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <div className="grid md:grid-cols-[1fr_320px]">
            <div className="p-5">
              {[
                ["#1", "Classic HQ", "v81", "12,430 quota"],
                ["#2", "Single Day Clear", "Artifice", "4,180 scrap"],
                ["#3", "Single Moon HQ", "Titan", "8,900 quota"]
              ].map(([rank, board, version, value]) => (
                <div key={board} className="grid grid-cols-[52px_1fr] items-center gap-3 py-4 shadow-[inset_0_-1px_0_#ebebeb] md:grid-cols-[64px_1fr_110px_140px]">
                  <span className="font-mono text-sm text-[#666]">{rank}</span>
                  <span className="font-semibold text-[#171717]">{board}</span>
                  <span className="font-mono text-xs text-[#666]">{version}</span>
                  <span className="text-sm font-medium text-[#171717]">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#fafafa] p-5 shadow-[inset_1px_0_0_#ebebeb]">
              <p className="text-xs font-medium text-[#666]">React stack</p>
              <div className="mt-4 grid gap-3 text-left">
                {["shadcn-style UI", "Tailwind tokens", "motion.js transitions"].map((item) => (
                  <div key={item} className="rounded-md bg-white px-3 py-3 text-sm font-medium shadow-[0_0_0_1px_rgb(235,235,235)]">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="section-shell">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>tracks</Badge>
            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-normal text-[#171717]">Choose the board that matches the run</h2>
          </div>
          <Button asChild variant="secondary">
            <Link to="/guides">
              <BookOpen className="h-4 w-4" />
              Read guides
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
              <Link to={card.href} className="group block">
                <Card className="h-full transition-transform group-hover:-translate-y-0.5">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <img src={card.logo} alt="" className="h-12 w-12 object-contain" />
                      <ArrowRight className="h-5 w-5 text-[#808080] transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="pt-6 text-xs font-medium uppercase text-[#666]">{card.label}</p>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.copy}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="mb-10 max-w-2xl">
          <Badge>workflow</Badge>
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-normal text-[#171717]">From route to ranked entry</h2>
          <p className="mt-4 text-lg leading-8 text-[#4d4d4d]">Functional color is reserved for the run workflow: develop, preview, then ship.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {workflow.map(([label, title, copy, color]) => (
            <Card key={label} className="p-5">
              <p className="font-mono text-xs uppercase dark:!text-white" style={{ color }}>{label}</p>
              <h3 className="mt-4 text-2xl font-semibold text-[#171717]">{title}</h3>
              <p className="mt-3 text-base leading-7 text-[#4d4d4d]">{copy}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <Card className="grid overflow-hidden md:grid-cols-[1fr_360px]">
          <div className="p-8 md:p-10">
            <Badge>community</Badge>
            <h2 className="mt-6 text-4xl font-bold leading-tight tracking-normal text-[#171717]">Built for runners and verifiers</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4d4d4d]">
              Profiles, staff roles, submissions, evidence, and guide pages now live inside one React application.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="https://discord.com/invite/usYCEz49Je" target="_blank" rel="noreferrer">
                  <Users className="h-4 w-4" />
                  Join Discord
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/admin">
                  <ShieldCheck className="h-4 w-4" />
                  Staff tools
                </Link>
              </Button>
            </div>
          </div>
          <div className="bg-[#fafafa] p-8 shadow-[inset_1px_0_0_#ebebeb] md:p-10">
            {["Classic queue", "Modded queue", "Recently verified"].map((item) => (
              <div key={item} className="mb-3 rounded-md bg-white px-3 py-3 text-sm font-medium shadow-[0_0_0_1px_rgb(235,235,235)]">{item}</div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
