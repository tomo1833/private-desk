import '@testing-library/jest-dom';
import React from 'react';
import { jest } from '@jest/globals';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return React.createElement('a', { href }, children);
  };
});

// Mock Next.js Image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
    return React.createElement('img', { src, alt, width, height });
  };
});

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ /* モックレスポンス */ }),
  } as Response)
);

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock implements ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn();
  constructor(public callback: ResizeObserverCallback) {}
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;


// ✅ IntersectionObserver モック（型指定付き）
class IntersectionObserverMock implements IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn<() => IntersectionObserverEntry[]>(); 
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
  constructor(public callback: IntersectionObserverCallback, public options?: IntersectionObserverInit) {}
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

