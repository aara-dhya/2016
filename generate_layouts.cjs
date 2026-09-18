const fs = require('fs');
const path = require('path');

const pages = [
  { dir: 'src/app/(dashboard)/home', title: 'Home' },
  { dir: 'src/app/(dashboard)/directory', title: 'Directory' },
  { dir: 'src/app/(dashboard)/user', title: 'Inventory' },
  { dir: 'src/app/(dashboard)/admin', title: 'Admin' },
  { dir: 'src/app/(dashboard)/webhooks', title: 'Webhooks' },
  { dir: 'src/app/(dashboard)/auditor', title: 'Auditor' },
  { dir: 'src/app/(auth)/login', title: 'Login' },
  { dir: 'src/app/(auth)/signup', title: 'Sign Up' },
  { dir: 'src/app/verify', title: 'Verify' },
];

pages.forEach(page => {
  const fullDir = path.join(__dirname, page.dir);
  const layoutPath = path.join(fullDir, 'layout.tsx');
  
  if (fs.existsSync(fullDir)) {
    const layoutContent = `export const metadata = {\n  title: '${page.title} | Nexus'\n};\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return children;\n}\n`;
    fs.writeFileSync(layoutPath, layoutContent);
    console.log(`Created ${layoutPath}`);
  }
});
