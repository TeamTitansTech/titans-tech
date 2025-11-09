'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wrench, FolderKanban, Building2 } from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/home',
    icon: LayoutDashboard,
  },
  {
    name: 'Companies',
    href: '/companies',
    icon: Building2,
  },
  {
    name: 'Blueprints',
    href: '/blueprints',
    icon: FolderKanban,
  },
  {
    name: 'Machines',
    href: '/machines',
    icon: Wrench,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1a1d29] text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">InspectPro</h1>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6">
        <div className="px-4 mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Navigation
          </h2>
        </div>
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
