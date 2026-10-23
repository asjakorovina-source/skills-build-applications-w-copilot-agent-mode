import { CapabilityCard } from './CapabilityCard.js';

type TeamEntry = { name?: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  return <CapabilityCard<TeamEntry>
    title="Teams"
    description="Manage teams and members."
    resourcePath="/api/teams"
    itemsKey="teams"
    emptyText="No teams available yet."
    renderItem={(team) => <><strong>{team.name ?? 'Unnamed team'}</strong> · {team.mascot ?? 'No mascot'} · {team.members?.length ?? 0} members</>}
  />;
}
