const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'src/app/(dashboard)/home/page.tsx', title: 'Home' },
  { path: 'src/app/(dashboard)/directory/page.tsx', title: 'Directory' },
  { path: 'src/app/(dashboard)/user/page.tsx', title: 'Inventory' },
  { path: 'src/app/(dashboard)/admin/page.tsx', title: 'Admin' },
  { path: 'src/app/(dashboard)/webhooks/page.tsx', title: 'Webhooks' },
  { path: 'src/app/(dashboard)/auditor/page.tsx', title: 'Auditor' },
  { path: 'src/app/(auth)/login/page.tsx', title: 'Login' },
  { path: 'src/app/(auth)/signup/page.tsx', title: 'Sign Up' },
  { path: 'src/app/verify/page.tsx', title: 'Verify' },
];

pages.forEach(page => {
  const fullPath = path.join(__dirname, page.path);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if it already has metadata
    if (!content.includes('export const metadata')) {
      // We must add "import { Metadata } from 'next';" if not present?
      // Actually Next.js allows simple export const metadata = { title: ... } without type
      const metadataExport = `\nexport const metadata = {\n  title: '${page.title}'\n};\n\n`;
      
      // If file has 'use client', we CANNOT export metadata from a client component!
      if (content.includes("'use client'") || content.includes('"use client"')) {
        console.log(`Skipping ${page.path} because it is a client component.`);
      } else {
        // Insert after imports
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const nextLineIndex = content.indexOf('\n', lastImportIndex);
          content = content.slice(0, nextLineIndex + 1) + metadataExport + content.slice(nextLineIndex + 1);
        } else {
          content = metadataExport + content;
        }
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${page.path}`);
      }
    }
  }
});
