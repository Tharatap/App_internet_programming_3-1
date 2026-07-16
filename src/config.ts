/**
 * Remote data source configuration.
 *
 * The product/category data lives in JSON files uploaded to GitHub. The app
 * fetches them at runtime instead of importing hardcoded data.
 *
 * 👉 เปลี่ยน 3 ค่านี้ให้ตรงกับ repo ของคุณ:
 *    <USER>   = ชื่อ GitHub username / org
 *    <REPO>   = ชื่อ repository
 *    <BRANCH> = ชื่อ branch (ปกติคือ main)
 *
 * ตัวอย่าง URL ที่ได้:
 *    https://raw.githubusercontent.com/nindam/chaje-electric/main/src/data/products.json
 *
 * หมายเหตุ: ถ้าดึงจาก GitHub ไม่สำเร็จ (เน็ตล่ม / ยังไม่ตั้งค่า) แอปจะใช้ไฟล์ JSON
 * ที่ bundle มากับแอปเป็น fallback โดยอัตโนมัติ
 */
const GITHUB_USER = '<USER>';
const GITHUB_REPO = '<REPO>';
const GITHUB_BRANCH = 'main';

export const DATA_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/src/data`;

export const PRODUCTS_URL = `${DATA_BASE_URL}/products.json`;
export const CATEGORIES_URL = `${DATA_BASE_URL}/categories.json`;

/**
 * ตั้งเป็น false เพื่อบังคับใช้ไฟล์ JSON ในเครื่อง (ไม่ยิงเน็ต) — สะดวกตอน dev
 * หรือยังไม่ได้อัปโหลดขึ้น GitHub
 */
export const USE_REMOTE_DATA = true;
