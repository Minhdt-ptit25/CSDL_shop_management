/**
 * Chuyển value bất kỳ sang chuỗi "YYYY-MM-DD".
 * Trả về undefined nếu value rỗng hoặc không hợp lệ.
 */
function toDateOnlyString(value) {
  if (value == null || value === "") return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

/**
 * Chuyển Prisma Decimal / bigint / string sang number JS.
 */
function toNumber(value) {
  if (value == null) return value;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  if (typeof value === "object") {
    if (typeof value.toNumber === "function") return value.toNumber();
    if (typeof value.toString === "function") return Number(value.toString());
  }
  return Number(value);
}

module.exports = { toDateOnlyString, toNumber };
