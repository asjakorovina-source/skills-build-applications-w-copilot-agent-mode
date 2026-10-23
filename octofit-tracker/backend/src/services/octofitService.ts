import { Activity, Team, User, Workout } from '../models/index.js';
import { isValidObjectId } from 'mongoose';

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function requiredText(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) throw httpError(`${field} is required`, 400);
  return value.trim();
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw httpError('Activity details are required', 400);
  const userId = input.userId;
  const teamId = input.teamId;
  if (typeof userId !== 'string' || !isValidObjectId(userId)) throw httpError('A valid userId is required', 400);
  if (typeof teamId !== 'string' || !isValidObjectId(teamId)) throw httpError('A valid teamId is required', 400);
  const type = requiredText(input.type, 'type');
  const minutes = input.minutes;
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) throw httpError('minutes must be a positive number', 400);
  const occurredAt = input.occurredAt === undefined ? new Date() : new Date(String(input.occurredAt));
  if (Number.isNaN(occurredAt.getTime())) throw httpError('occurredAt must be a valid date', 400);

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) throw httpError('The specified user or team does not exist', 404);

  return Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw httpError('Team details are required', 400);
  const name = requiredText(input.name, 'name');
  const mascot = requiredText(input.mascot, 'mascot');
  const members = input.members ?? [];
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !isValidObjectId(member))) {
    throw httpError('members must be an array of valid user IDs', 400);
  }
  const uniqueMembers = [...new Set(members)];
  const users = uniqueMembers.length ? await User.find({ _id: { $in: uniqueMembers } }).select('_id') : [];
  if (users.length !== uniqueMembers.length) throw httpError('One or more members do not exist', 404);

  const team = await Team.create({ name, mascot, members: uniqueMembers });
  if (uniqueMembers.length) await User.updateMany({ _id: { $in: uniqueMembers } }, { $set: { team: team._id } });
  return team;
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map(({ _id }) => _id) } }).select('name').lean();
  const names = new Map(teams.map((team) => [team._id.toString(), team.name]));
  return totals.flatMap(({ _id, totalPoints }, index) => {
    const teamName = names.get(_id.toString());
    return teamName ? [{ team: _id, teamName, totalPoints, rank: index + 1 }] : [];
  });
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError('User not found', 404);
  const [workouts, recentActivity] = await Promise.all([
    Workout.find().lean(),
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).select('type').lean(),
  ]);
  const focus = user.fitnessGoal || recentActivity?.type || '';
  return workouts
    .sort((left, right) => Number(right.focus === focus) - Number(left.focus === focus))
    .map((workout) => ({
      ...workout,
      reason: `Recommended for your ${workout.focus} goal${recentActivity ? ` based on your recent ${recentActivity.type} activity` : ''}.`,
    }));
}

export { User };
