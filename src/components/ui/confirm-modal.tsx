'use client';

import { AlertTriangle, Info, X, Edit3 } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ModalType = 'confirm' | 'alert' | 'prompt';

interface ConfirmModalProps {
  isOpen: boolean;
  type: ModalType;
  message: string;
  placeholder?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  type,
  message,
  placeholder,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, []);

  // Bloqueia scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm transition-opacity"
        onClick={type === 'alert' ? () => {
          setInputValue('');
          onConfirm();
        } : () => {
          setInputValue('');
          onCancel();
        }}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md bg-brand-cream border-2 border-brand-border shadow-[4px_4px_0px_var(--brand-ink)] flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between p-6 border-b border-brand-border/30 bg-brand-border/10">
          <div className="flex items-center gap-3 text-brand-ink">
            {type === 'confirm' && <AlertTriangle className="w-6 h-6 text-brand-tinto" />}
            {type === 'alert' && <Info className="w-6 h-6 text-brand-olive" />}
            {type === 'prompt' && <Edit3 className="w-6 h-6 text-amber-600" />}
            <h2 className="text-lg font-serif font-bold uppercase tracking-wider">
              {type === 'confirm' ? 'Confirmação' : type === 'alert' ? 'Aviso' : 'Entrada Necessária'}
            </h2>
          </div>
          <button 
            onClick={type === 'alert' ? () => {
              setInputValue('');
              onConfirm();
            } : () => {
              setInputValue('');
              onCancel();
            }}
            className="text-brand-ink/50 hover:text-brand-tinto transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-brand-ink/80 text-sm leading-relaxed font-medium">
          {message}
          {type === 'prompt' && (
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="mt-4 w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
              autoFocus
            />
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3 justify-end">
          {(type === 'confirm' || type === 'prompt') && (
            <button
              onClick={() => {
                setInputValue('');
                onCancel();
              }}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-ink border border-brand-border hover:bg-brand-border/20 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => {
              const value = inputValue;
              setInputValue('');
              onConfirm(type === 'prompt' ? value : undefined);
            }}
            className={`px-6 py-2.5 text-xs font-serif font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_var(--brand-ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_var(--brand-ink)] ${
              type === 'confirm' 
                ? 'bg-brand-tinto hover:bg-brand-tinto-light border-brand-tinto' 
                : type === 'prompt'
                ? 'bg-amber-600 hover:bg-amber-700 border-amber-600'
                : 'bg-brand-olive hover:bg-brand-olive-light border-brand-olive'
            }`}
          >
            {type === 'confirm' ? 'Confirmar' : type === 'prompt' ? 'Confirmar' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
