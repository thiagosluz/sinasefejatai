'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ConfirmModal, ModalType } from '@/components/ui/confirm-modal';

interface ModalContextData {
  confirm: (message: string) => Promise<boolean>;
  alert: (message: string) => Promise<void>;
}

const ModalContext = createContext<ModalContextData | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ModalType>('confirm');
  
  // Guardamos as funções de resolução da Promise atual
  const resolver = useRef<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((msg: string): Promise<boolean> => {
    setMessage(msg);
    setType('confirm');
    setIsOpen(true);

    return new Promise((resolve) => {
      resolver.current = { resolve };
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

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolver.current) {
      resolver.current.resolve(true);
      resolver.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolver.current) {
      resolver.current.resolve(false);
      resolver.current = null;
    }
  }, []);

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        type={type}
        message={message}
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
