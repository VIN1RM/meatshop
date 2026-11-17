'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { ImageOff, LoaderCircle, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { resolveAssetUrl } from '@/shared/lib/api';
import { cn } from '@/shared/lib/utils';

type ImagePreviewProps = {
  src?: string | null;
  title: string;
  children: ReactNode;
  className?: string;
};

function PreviewImage({ src, title }: { src: string; title: string }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  return <div className="relative grid h-[min(70dvh,42rem)] min-h-40 place-items-center overflow-hidden rounded-xl bg-slate-100">
    {loading && !failed && <span role="status" className="flex items-center gap-2 text-sm text-slate-600"><LoaderCircle aria-hidden="true" className="size-5 animate-spin" />Carregando imagem...</span>}
    {failed ? <p role="alert" className="flex flex-col items-center gap-3 p-6 text-center text-sm text-slate-600"><ImageOff aria-hidden="true" className="size-8" />Não foi possível carregar a imagem. Feche e tente novamente.</p> : <Image
      unoptimized fill sizes="(max-width: 768px) 90vw, 900px" src={src} alt={title}
      className={cn('object-contain p-2 transition-opacity', loading ? 'opacity-0' : 'opacity-100')}
      onLoad={() => setLoading(false)} onError={() => { setLoading(false); setFailed(true); }}
    />}
  </div>;
}

export function ImagePreview({ src, title, children, className }: ImagePreviewProps) {
  const url = resolveAssetUrl(src);
  if (!url) return <span className={className}>{children}</span>;
  return <Dialog>
    <DialogTrigger asChild>
      <button type="button" aria-label={`Ampliar ${title.toLocaleLowerCase('pt-BR')}`} title="Ampliar imagem"
        className={cn('group/preview relative inline-flex shrink-0 cursor-zoom-in items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2', className)}>
        {children}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center rounded-[inherit] bg-black/35 text-white opacity-0 transition-opacity group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100"><Maximize2 className="size-4" /></span>
      </button>
    </DialogTrigger>
    <DialogContent className="max-w-5xl gap-4 p-3 sm:p-5">
      <DialogHeader className="pr-10 text-left">
        <DialogTitle className="break-words text-base">{title}</DialogTitle>
        <DialogDescription className="sr-only">Imagem ampliada. Pressione Escape ou use o botão Fechar para voltar.</DialogDescription>
      </DialogHeader>
      <PreviewImage key={url} src={url} title={title} />
    </DialogContent>
  </Dialog>;
}
