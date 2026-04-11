function toDateOnlyString(value) {
  if (!value) return value;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function toNumber(value) {
  if (value == null) return value;
  if (typeof value === "number") return value;
  // Prisma Decimal (decimal.js) -> string/number
  if (typeof value === "string") return Number(value);
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "object" && typeof value.toNumber === "function") return value.toNumber();
  if (typeof value === "object" && typeof value.toString === "function") return Number(value.toString());
  return Number(value);
}

module.exports = { toDateOnlyString, toNumber };

