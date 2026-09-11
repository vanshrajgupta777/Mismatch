import cron from 'node-cron';
import { User } from '../models/User.js';

/**
 * Returns the Monday 00:00:00 UTC date of the week for a given date
 */
export const getWeekCycleDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  // diff to previous Monday: (day + 6) % 7
  const diff = d.getDate() - ((day + 6) % 7);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Reset likes for all users according to their likesCarryOver preference:
 * - If likesCarryOver is true: add 3 likes (likesRemaining += 3)
 * - If likesCarryOver is false: reset to 3 likes (likesRemaining = 3)
 */
export const resetWeeklyLikes = async () => {
  try {
    console.log('[Cron] Initiating weekly likes refresh...');

    // 1. Users with likesCarryOver = true
    const carryOverRes = await User.updateMany(
      { likesCarryOver: true },
      { $inc: { likesRemaining: 3 } }
    );

    // 2. Users with likesCarryOver = false (or undefined)
    const resetRes = await User.updateMany(
      { $or: [{ likesCarryOver: false }, { likesCarryOver: { $exists: false } }] },
      { $set: { likesRemaining: 3 } }
    );

    console.log(
      `[Cron] Weekly likes refreshed: ${carryOverRes.modifiedCount} carried over (+3), ${resetRes.modifiedCount} reset to 3.`
    );
    return {
      success: true,
      carriedOverCount: carryOverRes.modifiedCount,
      resetCount: resetRes.modifiedCount,
    };
  } catch (error) {
    console.error('[Cron] Error during weekly likes refresh:', error);
    throw error;
  }
};

/**
 * Initialize cron schedule
 * Runs every Sunday midnight (0 0 * * 0)
 */
export const initCronJobs = () => {
  cron.schedule('0 0 * * 0', async () => {
    console.log('[Cron] Sunday midnight triggered: Running weekly likes refresh...');
    await resetWeeklyLikes();
  });
  console.log('[Cron] Weekly likes refresh job scheduled (Sundays at 00:00).');
};
