import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LoadingPanel } from "@/components/LoadingPanel";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const roleGroups = [
  ["admin", "Admins"],
  ["verifier", "Verifiers"],
  ["modded-verifier", "Modded Verifiers"],
  ["site-developer", "Site Developers"]
];

export function AboutPage() {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      setLoading(true);
      try {
        const snapshot = await getDocs(query(collection(db, "users"), where("roles", "array-contains-any", roleGroups.map(([role]) => role))));
        const next = {};
        roleGroups.forEach(([role]) => {
          next[role] = [];
        });
        snapshot.forEach((doc) => {
          const user = doc.data();
          (user.roles || []).forEach((role) => {
            if (next[role]) next[role].push(user);
          });
        });
        if (!cancelled) setGroups(next);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadTeam();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section-shell">
      <PageHeader eyebrow="about" title="About High Quota HQ">
        A platform for challenge runners who push Lethal Company to its limits through high quota routes, single moon runs, and single day clears.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {loading ? (
          <LoadingPanel variant="about-team" />
        ) : (
        <Card className="p-5">
          <h2 className="text-2xl font-semibold text-[#171717]">Our Team</h2>
          <div className="mt-5 grid gap-5">
            {roleGroups.map(([role, title]) => (
              <div key={role} className="pt-4 shadow-[inset_0_1px_0_#ebebeb]">
                <h3 className="text-xs font-semibold uppercase text-[#666]">{title}</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(groups[role] || []).length === 0 ? (
                    <p className="text-sm text-[#666]">No members listed.</p>
                  ) : (
                    groups[role].map((member) => (
                      <a key={`${role}-${member.username}`} href={`/profile/${encodeURIComponent(member.username)}`} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-border hover:bg-[#fafafa]">
                        <img src={member.profilePicture || "/default-avatar.png"} alt="" className="h-10 w-10 rounded-full object-cover" />
                        <span className="font-medium text-[#171717]">{member.username}</span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
        )}

        <div className="grid gap-4">
          <ContactCard title="Contact Us" copy="Questions, feedback, and corrections are welcome." href="mailto:highquotahq@gmail.com" label="Email" />
          <ContactCard title="Join Discord" copy="Stay connected with runners and verifiers." href="https://discord.com/invite/usYCEz49Je" label="Discord" />
          <ContactCard title="Support Us" copy="Help maintain and improve the site." href="https://ko-fi.com/highquotahq" label="Ko-fi" />
        </div>
      </div>
    </section>
  );
}

function ContactCard({ title, copy, href, label }) {
  return (
    <Card className="p-5">
      <h3 className="text-xl font-semibold text-[#171717]">{title}</h3>
      <p className="mt-2 text-[#4d4d4d]">{copy}</p>
      <Button asChild className="mt-5" variant="secondary">
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>{label}</a>
      </Button>
    </Card>
  );
}
