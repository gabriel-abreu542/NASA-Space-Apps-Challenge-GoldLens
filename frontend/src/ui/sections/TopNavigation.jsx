import { NavLink } from "react-router-dom";
/**
 * Barra de navegação superior
 * Simula as abas da aplicação: Data, Training, Results, etc.
 */

const navItems = [
    { name: "Treinamento", path: "/treinamento" },
    { name: "Análise Individual", path: "/analise-individual" },
    { name: "Análise em Lote", path: "/analise-em-lote" },
    { name: "Como Funciona", path: "/como-funciona" },
  ];

const TopNavigation = () => (


    <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-8">
        <h1 className="text-2xl font-black tracking-tight">GoldLens</h1>
        <nav className="flex gap-6 text-sm text-zinc-400">
          {navItems.map(
            (item) => (
              <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `hover:text-zinc-200 transition-colors ${
                  isActive ? "text-zinc-100 font-semibold" : ""
                }`
              }
            >
              {item.name}
            </NavLink>
            )
          )}
        </nav>
      </div>
    </header>
);

export default TopNavigation;