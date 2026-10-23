import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName?: string; totalPoints?: number; rank?: number };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardEntry>
    title="Leaderboard"
    description="Compare team point totals."
    resourcePath="/api/leaderboard"
    itemsKey="leaderboard"
    emptyText="No leaderboard rankings yet."
    renderItem={(entry) => <><strong>#{entry.rank ?? '-'} {entry.teamName ?? 'Team'}</strong> · {entry.totalPoints ?? 0} points</>}
  />;
}
