import { useState } from "react";
import React from "react";

export function Navbar({ onNavigate }) {
    const [open, setOpen] = useState(false);

    return (
        <header className="bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-700 text-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                <span className="inline-block w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">GL</span>
                                <div>
                                    <h1 className="text-lg font-semibold">GoldLens</h1>
                                    <p className="text-xs text-white/80">Usando IA para identificar exoplanetas</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="hidden md:flex space-x-6 items-center">
                        <a href="#features" className="hover:underline text-sm">Dashboard</a>
                        <a href="#how" className="hover:underline text-sm">Análise Individual</a>
                        <a href="#how" className="hover:underline text-sm">Análise em Lote</a>
                        <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate ? onNavigate('/about') : (window.location.href = '/about') }} className="hover:underline text-sm">Sobre</a>
                    </nav>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setOpen(!open)}
                            aria-expanded={open}
                            aria-label="Open menu"
                            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            <svg className={`h-6 w-6 transition-transform ${open ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden ${open ? 'block' : 'hidden'} px-4 pt-2 pb-4 space-y-2`}> 
                <a href="#features" className="block text-sm hover:underline">Features</a>
                <a href="#how" className="block text-sm hover:underline">How it works</a>
                <a href="/about" onClick={(e) => { e.preventDefault(); setOpen(false); onNavigate ? onNavigate('/about') : (window.location.href = '/about') }} className="block text-sm hover:underline">About</a>
                <a href="#contact" className="block text-sm bg-white text-slate-900 px-3 py-1.5 rounded-md font-medium w-max">Get started</a>
            </div>
        </header>
    );
}

export default Navbar;