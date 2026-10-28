import { Suspense } from 'react';
import AppAuthForm from '@/app/components/AppAuthForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div role="status">読み込み中...</div>}>
      <AppAuthForm mode="login" />
    </Suspense>
  );
}
