'use client';

import gsap from 'gsap';
import React, { useEffect, useRef } from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function GButton({ children, className = '', onClick, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const initialBg = window.getComputedStyle(el).backgroundColor || '';

    const onDown = () => {
      gsap.killTweensOf(el);
      gsap.to(el, { backgroundColor: '#bfdbfe', duration: 0.12, scale: 0.98 });
    };
    const onUp = () => {
      gsap.killTweensOf(el);
      gsap.to(el, { backgroundColor: initialBg, duration: 0.18, scale: 1, clearProps: 'scale' });
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onUp);
    };
  }, []);

  return (
    <button ref={ref} onClick={onClick} className={className} {...rest}>
      {children}
    </button>
  );
}
