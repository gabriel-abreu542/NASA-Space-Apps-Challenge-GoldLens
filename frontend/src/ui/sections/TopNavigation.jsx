import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Treinamento", path: "/treinamento" },
  { name: "Análise Individual", path: "/analise-individual" },
  { name: "Análise em Lote", path: "/analise-em-lote" },
  { name: "Como Funciona", path: "/como-funciona" },
];

const TopNavigation = () => {
  const [open, setOpen] = useState(false);

  // Fecha com ESC
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-800 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <h1 className="text-2xl font-black tracking-tight">GoldLens</h1>

          {/* NAV DESKTOP (≥426px) */}
          <nav className="hidden min-[426px]:flex gap-6 text-sm text-zinc-400">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `transition-colors hover:text-zinc-200 ${
                    isActive ? "text-zinc-100 font-semibold" : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* BOTÃO HAMBÚRGUER (≤425px) */}
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-800/50 hover:text-white min-[426px]:hidden"
          >
            {/* Ícone animado (3 barras → X) */}
            <span
              className={`absolute block h-[2px] w-5 bg-current transition-all duration-300 ${
                open ? "translate-y-0 rotate-45" : "-translate-y-2 rotate-0"
              }`}
            />
            <span
              className={`absolute block h-[2px] w-5 bg-current transition-all duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute block h-[2px] w-5 bg-current transition-all duration-300 ${
                open ? "translate-y-0 -rotate-45" : "translate-y-2 rotate-0"
              }`}
            />
          </button>
        </div>

        {/* PAINEL MOBILE (≤425px) com slide + fade */}
        <div
          id="mobile-nav"
          className={`min-[426px]:hidden overflow-hidden border-t border-zinc-800 bg-zinc-950 transition-[max-height,opacity,transform] duration-300 ease-out ${
            open
              ? "max-h-[70vh] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-2"
          }`}
        >
          <nav className="mx-auto w-full max-w-7xl px-6 py-2">
            <ul className="flex flex-col">
              {navItems.map((item, i) => (
                <li
                  key={item.name}
                  className={`transition-all duration-300 ${
                    open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  }`}
                  style={{ transitionDelay: `${open ? i * 40 : 0}ms` }}
                >
                  <NavLink
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm ${
                        isActive
                          ? "bg-zinc-800/60 text-white"
                          : "text-zinc-300 hover:bg-zinc-800/40 hover:text-white"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* OVERLAY (≤425px) para fechar ao clicar fora */}
      <button
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 min-[426px]:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
    </>
  );
};

export default TopNavigation;
