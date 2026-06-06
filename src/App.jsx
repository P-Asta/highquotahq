import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "@/components/Shell";
import { AboutPage } from "@/pages/AboutPage";
import { AdminPage } from "@/pages/AdminPage";
import { AdminReviewPage } from "@/pages/AdminReviewPage";
import { GuidesPage } from "@/pages/GuidesPage";
import { HomePage } from "@/pages/HomePage";
import { LeaderboardsPage } from "@/pages/LeaderboardsPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RulesPage } from "@/pages/RulesPage";
import { SubmitRunPage } from "@/pages/SubmitRunPage";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboards" element={<Navigate to="/leaderboards/vanilla" replace />} />
        <Route path="/leaderboards/:track" element={<LeaderboardsPage />} />
        <Route path="/submit" element={<Navigate to="/submit/vanilla" replace />} />
        <Route path="/submit/:track" element={<SubmitRunPage />} />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/review/:type/:collectionName/:runId" element={<AdminReviewPage />} />
        <Route path="/lethal-company/pages/leaderboards.html" element={<Navigate to="/leaderboards/vanilla" replace />} />
        <Route path="/lethal-company-modded/pages/leaderboards.html" element={<Navigate to="/leaderboards/modded" replace />} />
        <Route path="/lethal-company/pages/submissions.html" element={<Navigate to="/submit/vanilla" replace />} />
        <Route path="/lethal-company-modded/pages/submissions.html" element={<Navigate to="/submit/modded" replace />} />
        <Route path="/lethal-company/pages/guides.html" element={<Navigate to="/guides" replace />} />
        <Route path="/lethal-company/pages/rules.html" element={<Navigate to="/rules" replace />} />
        <Route path="/lethal-company-modded/pages/rules.html" element={<Navigate to="/rules" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
