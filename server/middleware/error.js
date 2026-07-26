/** error handler กลาง — คืนรูปแบบเดียวกันเสมอ ห้ามส่ง stack trace ออกไปหา client */
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'ข้อมูลนี้มีอยู่แล้วในระบบ' });
  }

  res.status(err.status || 500).json({ message: err.message || 'เกิดข้อผิดพลาดในระบบ' });
}

/** ห่อ async route handler กันลืม try/catch — error จะไหลไปที่ errorHandler อัตโนมัติ */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, asyncHandler };
