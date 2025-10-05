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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
  {/* Barra de navegação no topo */}
  <TopNavigation />

  <main className="flex-grow p-6 px-4 py-6 sm:px-6 lg:px-8">
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/treinamento" element={<Dashboard />} />
      <Route path="/analise-individual" element={<IndividualForm />} />
      <Route path="/analise-em-lote" element={<BatchAnalysis />} />
      <Route path="/como-funciona" element={<AboutPage />} />
    </Routes>
  </main>

  <footer className="bg-zinc-950 w-full text-xs text-zinc-600 py-8 sm:py-10">
    <div className="max-w-7xl mx-auto px-6 text-center">
      © {new Date().getFullYear()} GoldLens. Todos os direitos reservados.
    </div>
  </footer>
</div>

  );
}