import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title?: string; reason?: string };

export default function Workouts() {
  return <CapabilityCard<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    resourcePath={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    itemsKey="suggestions"
    emptyText="No workout suggestions available yet."
    renderItem={(suggestion) => <><strong>{suggestion.title ?? 'Workout'}</strong>{suggestion.reason && <> · {suggestion.reason}</>}</>}
  />;
}
