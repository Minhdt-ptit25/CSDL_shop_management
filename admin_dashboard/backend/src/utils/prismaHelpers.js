/**
 * Kiểm tra lỗi unique constraint của Prisma (P2002).
 */
function isUniqueConstraintError(err) {
  return err?.code === "P2002";
}

/**
 * Trả về message cụ thể dựa vào field bị duplicate.
 */
function getDuplicateFieldMessage(err) {
  const target = err?.meta?.target;
  const fields = (Array.isArray(target) ? target : [target]).map((f) =>
    String(f).toLowerCase()
  );

  if (fields.includes("ma_nv"))  return "Mã NV đã tồn tại";
  if (fields.includes("ma_sp"))  return "Mã SP đã tồn tại";
  if (fields.includes("ma_kh"))  return "Mã KH đã tồn tại";
  if (fields.includes("ma_hd"))  return "Mã HĐ đã tồn tại";
  if (fields.includes("ma_ncc")) return "Mã NCC đã tồn tại";
  if (fields.includes("sdt"))    return "SĐT đã tồn tại";
  if (fields.includes("email"))  return "Email đã tồn tại";
  return "Giá trị đã tồn tại";
}

/**
 * Gửi response 400 với message duplicate phù hợp.
 */
function sendDuplicateError(res, err) {
  return res.status(400).json({ detail: getDuplicateFieldMessage(err) });
}

module.exports = { isUniqueConstraintError, sendDuplicateError };
