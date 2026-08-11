const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SHIFTS = ['A', 'B', 'C'];

/** ตรวจ dateFrom/dateTo/shift ที่รับมาจาก req.query (ทุกฟิลด์ optional) */
function validateDateRangeQuery({ dateFrom, dateTo, shift } = {}) {
  const errors = [];
  if (dateFrom && !DATE_RE.test(dateFrom)) errors.push('dateFrom must be in YYYY-MM-DD format');
  if (dateTo && !DATE_RE.test(dateTo)) errors.push('dateTo must be in YYYY-MM-DD format');
  if (dateFrom && dateTo && dateFrom > dateTo) errors.push('dateFrom must not be after dateTo');
  if (shift && !VALID_SHIFTS.includes(shift)) errors.push(`shift must be one of ${VALID_SHIFTS.join(', ')}`);
  return errors;
}

/** ตรวจ page/pageSize ที่รับมาจาก req.query (optional) */
function validatePagination({ page, pageSize } = {}) {
  const errors = [];
  if (page != null && (isNaN(page) || Number(page) < 1)) errors.push('page must be a positive integer');
  if (pageSize != null && (isNaN(pageSize) || Number(pageSize) < 1 || Number(pageSize) > 1000)) errors.push('pageSize must be between 1 and 1000');
  return errors;
}

module.exports = { validateDateRangeQuery, validatePagination };
