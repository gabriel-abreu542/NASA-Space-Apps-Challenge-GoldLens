import TopNavigation from "./ui/sections/TopNavigation";
import React from "react";
import "./index.css";
import Dashboard from "./ui/sections/Dashboard";
import BatchAnalysis from "./ui/sections/BatchAnalysis";
import { Routes, Route } from "react-router-dom";
import AboutPage from "./ui/sections/AboutPage";
import IndividualForm from "./ui/primitives/IndividualForm";

/**
 * Componente principal da aplicação
 * Essa tela representa o "Treinamento de Modelos"
 */
export default function App() {
  // Hook fictício apenas para simular o clique no botão "Train"

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Barra de navegação no topo */}
      <TopNavigation />

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/treinamento" element={<Dashboard />} />
          <Route path="/analise-individual" element={<IndividualForm />} />
          <Route path="/analise-em-lote" element={<BatchAnalysis />} />
          <Route path="/como-funciona" element={<AboutPage />} />
        </Routes>
      </main>

      <footer className="w-full py-10 text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          © {new Date().getFullYear()} GoldLens. Todos os direitos reservados.
        </div>
      </footer>

    
    </div>
  );
}