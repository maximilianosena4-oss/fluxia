"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

interface QuickItem {
  href: string;
  icon: string;
  label: string;
  desc: string;
  color: string;
}

const ITEMS: QuickItem[] = [
  { href: "/dashboard/tools",      icon: "🛠️", label: "Herramientas",  desc: "Hooks · Keywords · Checklist",  color: "var(--accent-primary)" },
  { href: "/dashboard/comparator", icon: "⚖️", label: "Comparador",    desc: "Comparás nichos lado a lado",   color: "var(--accent-secondary)" },
  { href: "/dashboard/thumbnails", icon: "🖼️", label: "Thumbnails",    desc: "Biblioteca de thumbnails",       color: "var(--accent-warning)" },
  { href: "/dashboard/analytics",  icon: "📊", label: "Analytics",     desc: "Tu progreso en gráficos",        color: "var(--accent-success)" },
];

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.3 } },
};

export function QuickAccessGrid() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {ITEMS.map((entry) => (
        <motion.div key={entry.href} variants={item}>
          <Link
            href={entry.href}
            className="group flex flex-col gap-2 rounded-xl border p-4 transition-all duration-200 card-hover"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            {/* Icon badge */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: `${entry.color}14` }}
            >
              {entry.icon}
            </div>

            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                {entry.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {entry.desc}
              </p>
            </div>

            {/* Arrow */}
            <svg
              className="w-3.5 h-3.5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: entry.color }}
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6-6m6 6-6 6" />
            </svg>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
