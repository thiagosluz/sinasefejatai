'use client';

import React, { createContext, useCallback, useContext, useRef,useState } from 'react';

import { ConfirmModal, ModalType } from '@/components/ui/confirm-modal';

interface ModalContextData {
  confirm: (message: string) => Promise<boolean>;
  alert: (message: string) => Promise<void>;
  prompt: (message: string, placeholder?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextData | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [type, setType] = useState<ModalType>('confirm');
  
  // Guardamos as funções de resolução da Promise atual
  const resolver = useRef<{ resolve: (value: unknown) => void } | null>(null);

  const confirm = useCallback((msg: string): Promise<boolean> => {
    setMessage(msg);
    setType('confirm');
    setIsOpen(true);

    return new Promise((resolve) => {
      resolver.current = { resolve: resolve as (value: unknown) => void };
    });
  }, []);

  const alert = useCallback((msg: string): Promise<void> => {
    setMessage(msg);
    setType('alert');
    setIsOpen(true);

    return new Promise((resolve) => {
      // Como o alert não retorna um valor booleano útil na prática, apenas resolvemos com true quando fecha
      resolver.current = { resolve: () => resolve() };
    });
  }, []);

  const prompt = useCallback((msg: string, ph: string = ''): Promise<string | null> => {
    setMessage(msg);
    setPlaceholder(ph);
    setType('prompt');
    setIsOpen(true);

    return new Promise((resolve) => {
      resolver.current = { resolve: resolve as (value: unknown) => void };
    });
  }, []);

  const handleConfirm = useCallback((value?: string) => {
    setIsOpen(false);
    if (resolver.current) {
      resolver.current.resolve(type === 'prompt' ? (value || '') : true);
      resolver.current = null;
    }
  }, [type]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolver.current) {
      resolver.current.resolve(type === 'prompt' ? null : false);
      resolver.current = null;
    }
  }, [type]);

  return (
    <ModalContext.Provider value={{ confirm, alert, prompt }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        type={type}
        message={message}
        placeholder={placeholder}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }
  return context;
}
