#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const pagesDir = path.resolve(frontendRoot, "src/pages");
const topbarFile = path.resolve(frontendRoot, "src/components/layout/Topbar.tsx");

// Pages intentionally using custom layouts rather than the standard PageHeader card
const PAGE_HEADER_EXCLUDED_PAGES = new Set([
  "src/pages/student/Dashboard.tsx",      // Custom personalized greeting hero banner
  "src/pages/student/Profile.tsx",        // Custom candidate profile card & upload avatar
  "src/pages/public/LandingPage.tsx",     // Public marketing hero
  "src/pages/public/Login.tsx",           // Public auth card
  "src/pages/public/Register.tsx",        // Public multi-step registration
  "src/pages/public/ForgotPassword.tsx",  // Public recovery
  "src/pages/NotFound.tsx",               // 404 error page
  "src/pages/Forbidden.tsx",              // 403 access control page
  "src/pages/admin/AdminContentManager.tsx", // Thin re-export of ContentManagerHub
  "src/pages/admin/AdminUsers.tsx",          // Thin wrapper of AdminStudents
]);

// Pages permitted to render their own <h1>
const H1_ALLOWED_PAGES = new Set([
  "src/pages/student/Dashboard.tsx",
  "src/pages/student/Profile.tsx",
  "src/pages/public/LandingPage.tsx",
  "src/pages/public/Login.tsx",
  "src/pages/public/Register.tsx",
  "src/pages/public/ForgotPassword.tsx",
  "src/pages/NotFound.tsx",
  "src/pages/Forbidden.tsx",
]);

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of list) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else if (dirent.isFile() && dirent.name.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

const pageFiles = getFilesRecursively(pagesDir);
const errors = [];
let checkedCount = 0;

for (const filePath of pageFiles) {
  const relPath = path.relative(frontendRoot, filePath).replace(/\\/g, "/");
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  checkedCount++;

  // 1. Check for PageHeader import & usage
  if (!PAGE_HEADER_EXCLUDED_PAGES.has(relPath)) {
    const importsPageHeader = content.includes("PageHeader");
    const rendersPageHeader = /<PageHeader[\s/>]/.test(content);

    if (!importsPageHeader || !rendersPageHeader) {
      errors.push({
        file: relPath,
        line: 1,
        rule: "MISSING_PAGE_HEADER",
        message: `Page component must import and render the shared PageHeader component.`,
      });
    }
  }

  // 2. Check for forbidden <h1> tag
  if (!H1_ALLOWED_PAGES.has(relPath)) {
    lines.forEach((line, index) => {
      if (/<h1[\s>]/i.test(line)) {
        errors.push({
          file: relPath,
          line: index + 1,
          rule: "FORBIDDEN_H1",
          message: `Only PageHeader is allowed to render <h1>. Found: ${line.trim()}`,
        });
      }
    });
  }
}

// 3. Check Topbar.tsx specifically (must not have <h1>)
if (fs.existsSync(topbarFile)) {
  const topbarRel = path.relative(frontendRoot, topbarFile).replace(/\\/g, "/");
  const topbarContent = fs.readFileSync(topbarFile, "utf-8");
  const topbarLines = topbarContent.split("\n");
  topbarLines.forEach((line, index) => {
    if (/<h1[\s>]/i.test(line)) {
      errors.push({
        file: topbarRel,
        line: index + 1,
        rule: "FORBIDDEN_H1_IN_TOPBAR",
        message: `Topbar must use <div/p aria-current="page"> instead of <h1> to satisfy one-h1-per-page rule. Found: ${line.trim()}`,
      });
    }
  });
}

console.log(`\n🔍 PageHeader & Heading Consistency Guard:`);
console.log(`   Checked ${checkedCount} page route files + Topbar layout.`);

if (errors.length > 0) {
  console.error(`\n❌ Found ${errors.length} header consistency violation(s):\n`);
  for (const err of errors) {
    console.error(`  • [${err.rule}] ${err.file}:${err.line}`);
    console.error(`    ${err.message}\n`);
  }
  process.exit(1);
} else {
  console.log(`✅ All audited student and admin pages adhere to PageHeader and single-<h1> rules.\n`);
  process.exit(0);
}
