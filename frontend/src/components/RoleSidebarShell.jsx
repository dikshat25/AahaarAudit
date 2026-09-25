import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, LogOut, Menu, X } from 'lucide-react';
import GovHeader from './GovHeader';

/**
 * Reusable left-sidebar shell for role portals that need multiple sections
 * (Customer, Owner). The Regulator/Inspector dashboard keeps its existing
 * top-tab layout, so this component is not used there.
 *
 * props:
 *  - portalLabel: small caption under the brand, e.g. "Customer Portal"
 *  - navItems: [{ key, label, icon: LucideIcon }]
 *  - activeKey / onNavigate
 *  - profile, onLogout
 *  - children: content for the active section
 */
export default function RoleSidebarShell({
  portalLabel,
  navItems,
  activeKey,
  onNavigate,
  profile,
  onLogout,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = navItems.find((n) => n.key === activeKey);

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0A2647] flex flex-col font-sans">
      <GovHeader />

      <header className="border-b border-[#0A2647]/10 gov-navbar px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white mr-1"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-9 h-9 rounded-full gov-emblem-ring flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#0A2647]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white leading-none">AAHAAR-AUDIT</h1>
            <span className="text-[10px] font-mono text-[#FF9933] uppercase tracking-wider hidden md:block">
              {portalLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-emerald-100">
            {profile?.full_name || profile?.business_name || ''}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden" id="main-content">
        {/* Desktop sidebar */}
        <nav className="hidden md:flex flex-col w-60 shrink-0 border-r border-[#0A2647]/10 bg-white py-4 overflow-y-auto">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-left transition-colors ${
                activeKey === key
                  ? 'text-[#0A2647] bg-[#0A2647]/5'
                  : 'text-[#0A2647]/55 hover:text-[#0A2647] hover:bg-[#0A2647]/5'
              }`}
            >
              {activeKey === key && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF9933] rounded-r"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.nav
                className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 md:hidden py-4 overflow-y-auto shadow-xl"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 38 }}
              >
                <div className="px-5 pb-3 mb-2 border-b border-[#0A2647]/10 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0A2647]" />
                  <span className="font-display font-bold text-[#0A2647]">AAHAAR-AUDIT</span>
                </div>
                {navItems.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      onNavigate(key);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-5 py-2.5 text-sm font-medium text-left transition-colors ${
                      activeKey === key ? 'text-[#0A2647] bg-[#0A2647]/5' : 'text-[#0A2647]/55'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            {activeItem?.icon && <activeItem.icon className="w-5 h-5 text-[#0A2647]/50" />}
            <h2 className="text-lg font-display font-bold text-[#0A2647]">{activeItem?.label}</h2>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
