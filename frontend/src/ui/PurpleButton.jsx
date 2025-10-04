// Botão padrão roxinho
export const PurpleButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-white text-sm font-semibold px-5 py-3 shadow-md"
  >
    {children}
  </button>
);