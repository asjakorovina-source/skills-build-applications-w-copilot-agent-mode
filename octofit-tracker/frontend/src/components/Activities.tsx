import { CapabilityCard } from './CapabilityCard.js';

type ActivityEntry = { type?: string; minutes?: number; points?: number };

export default function Activities() {
  return <CapabilityCard<ActivityEntry>
    title="Activities"
    description="Track student activity minutes and points."
    resourcePath="/api/activities"
    itemsKey="activities"
    emptyText="No activities recorded yet."
    renderItem={(activity) => <><strong>{activity.type ?? 'Activity'}</strong> · {activity.minutes ?? 0} minutes · {activity.points ?? 0} points</>}
  />;
}
