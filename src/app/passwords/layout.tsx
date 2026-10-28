'use client';

import type { ReactNode } from 'react';
import PasswordVaultGate from '@/app/components/PasswordVaultGate';

export default function PasswordsLayout({ children }: { children: ReactNode }) {
  return <PasswordVaultGate>{children}</PasswordVaultGate>;
}
