import React from 'react';

import { Card } from '../Card';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <>
    <Card>
    <p index={3} title="Treinamento do Modelo">
      GoldLens é uma solução baseada em IA desenvolvida para auxiliar na detecção de exoplanetas em conjuntos de dados astronômicos.
      Ao combinar um backend em Python com uma interface web moderna, nossa plataforma permite que os usuários pré-processarem dados, treinem 
      modelos de aprendizado de máquina e gerem previsões em tempo real.
      O GoldLens transforma processos científicos complexos em uma ferramenta acessível, colaborativa e escalável, tornando a exploração espacial mais próxima de todos.
    </p>
    
    <p index={4} title="Classificação & Explicações">
      Geramos rótulos (Confirmado, Candidato, Falso Positivo), expondo a
      importância de variáveis e matrizes de confusão para auditoria.
    </p>
  </Card>


  <div>
  <h2 className="text-lg font-medium text-violet-300 mb-4 my-10 ">Métricas de Referência</h2>
  <div className="flex flex-wrap gap-4">
  <p label="Accuracy" value="0,91" hint="Precisão global" />
  <p label="F1 Score" value="0,90" hint="Balanceia precisão/recall" />
  <p label="ROC AUC" value="0,95" hint="Separação entre classes" />
  </div>
  </div>

  {/* Como interpretar */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card title="Como interpretar as métricas?">
  <ul className="list-disc pl-5 space-y-2">
  <li><strong>Accuracy</strong>: proporção de acertos totais. Boa para visão geral.</li>
  <li><strong>F1</strong>: média harmônica entre precisão e recall — ideal quando há classes desbalanceadas.</li>
  <li><strong>ROC AUC</strong>: mede a separação entre positivos e negativos; quanto mais próximo de 1, melhor.</li>
  </ul>
  </Card>
  <Card title="Boas práticas">
  <ul className="list-disc pl-5 space-y-2">
  <li>Separe treino/validação por <em>stratified split</em>.</li>
  <li>Monitore <em>drift</em> de dados ao longo do tempo.</li>
  <li>Versione modelos e parâmetros em <em>Experiments</em>.</li>
  <li>Use explicações locais (ex.: SHAP) para casos borderline.</li>
  </ul>
  </Card>
  </div>


  {/* Call to action */}
  <div className="flex items-center my-15 justify-between gap-4 bg-gradient-to-r from-violet-800/20 to-fuchsia-800/10 border border-violet-900/40 rounded-2xl p-6">
  
  <button className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition-colors text-sm font-medium" >
  <a href="/treinamento"> Ir para Dashboard </a>
  </button>
  </div>


 </>
)
};

export default AboutPage;
