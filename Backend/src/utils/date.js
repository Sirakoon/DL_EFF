/**
 * Thailand-local-date helpers.
 *
 * `new Date().toISOString().slice(0, 10)` returns the UTC calendar date.
 * Thailand is UTC+7, so that's the *previous* day for the first ~7 hours of
 * every local day — e.g. a night-shift entry at 02:00 ICT would fail the
 * "production_date cannot be in the future" check. We pin to Asia/Bangkok
 * explicitly rather than relying on the server process's own TZ setting,
 * since that can't be assumed (e.g. a container defaulting to UTC).
 */
const BANGKOK_TZ = 'Asia/Bangkok';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BANGKOK_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const toDateStr = (d) => formatter.format(d); // en-CA locale formats as YYYY-MM-DD

const todayStr = () => toDateStr(new Date());

const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
};

module.exports = { BANGKOK_TZ, toDateStr, todayStr, daysAgoStr };
