'use client';

import Image from 'next/image';
import { CalendarDays, ExternalLink, UtensilsCrossed } from 'lucide-react';
import { DetailsDialog } from '@/shared/components/details-dialog';
import { ImagePreview } from '@/shared/components/image-preview';
import { DataSkeleton } from '@/shared/components/data-skeleton';
import { Button } from '@/shared/components/ui/button';
import { useApiQuery } from '@/shared/hooks/use-api-query';
import { resolveAssetUrl } from '@/shared/lib/api';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';

type RecipeDetails = {
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  tag: string | null;
  active: boolean;
  week_start: string | null;
  ingredients: { id: number; name: string; quantity: string; tip: string | null }[];
  steps: { id: number; step_number: number; description: string; tip: string | null }[];
  products: { id: number; product_name: string; product_price: number; call_to_action: string }[];
};

function videoLink(value: string | null) {
  try {
    const url = new URL(value ?? '');
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export function RecipeDetailsDialog({ recipeId, onClose }: { recipeId: number; onClose: () => void }) {
  const query = useApiQuery<RecipeDetails>(`/recipes/manage/${recipeId}`);
  const recipe = query.data;
  const video = videoLink(recipe?.video_url ?? null);

  return <DetailsDialog open onOpenChange={open => { if (!open) onClose(); }}
    title={recipe?.title ?? 'Detalhes da receita'}
    description="Ingredientes, modo de preparo e produtos em destaque."
    icon={UtensilsCrossed}>
    {query.isPending ? <DataSkeleton variant="form" label="Carregando receita..." /> : query.error ? (
      <div role="alert" className="space-y-3 text-sm text-red-700">
        <p>Não foi possível carregar a receita.</p>
        <Button variant="outline" onClick={() => void query.refetch()}>Tentar novamente</Button>
      </div>
    ) : recipe && <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      {recipe.image_url && <ImagePreview src={recipe.image_url} title={recipe.title} className="w-full overflow-hidden">
        <Image unoptimized src={resolveAssetUrl(recipe.image_url)} alt={recipe.title} width={900} height={500} className="max-h-80 w-full object-contain" />
      </ImagePreview>}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-3 py-1 font-semibold ${recipe.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{recipe.active ? 'Ativa' : 'Inativa'}</span>
        {recipe.tag && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{recipe.tag}</span>}
        {recipe.week_start && <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-800"><CalendarDays className="size-3" />Semana de {formatDate(recipe.week_start)}</span>}
      </div>
      {recipe.description && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">{recipe.description}</p>}
      <section className="space-y-3" aria-label="Ingredientes">
        <h3 className="font-semibold text-slate-900">Ingredientes</h3>
        {recipe.ingredients.length ? <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
          {recipe.ingredients.map(item => <li key={item.id} className="py-3 text-sm">
            <p className="break-words text-slate-800"><span className="font-semibold">{item.quantity}</span> {item.name}</p>
            {item.tip && <p className="mt-1 whitespace-pre-wrap break-words text-slate-500">Dica: {item.tip}</p>}
          </li>)}
        </ul> : <p className="text-sm text-slate-500">Sem ingredientes cadastrados.</p>}
      </section>
      <section className="space-y-3" aria-label="Modo de preparo">
        <h3 className="font-semibold text-slate-900">Modo de preparo</h3>
        {recipe.steps.length ? <ol className="space-y-4">
          {[...recipe.steps].sort((a, b) => a.step_number - b.step_number).map(step => <li key={step.id} className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-red-50 text-sm font-bold text-red-700">{step.step_number}</span>
            <div className="min-w-0 pt-1 text-sm leading-relaxed"><p className="whitespace-pre-wrap break-words text-slate-700">{step.description}</p>{step.tip && <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-amber-50 p-3 text-amber-900">Dica: {step.tip}</p>}</div>
          </li>)}
        </ol> : <p className="text-sm text-slate-500">Sem modo de preparo cadastrado.</p>}
      </section>
      {recipe.products.length > 0 && <section className="space-y-3" aria-label="Produtos em destaque">
        <h3 className="font-semibold text-slate-900">Produtos em destaque</h3>
        <ul className="space-y-2">{recipe.products.map(product => <li key={product.id} className="rounded-xl bg-slate-50 p-3 text-sm">
          <p className="break-words font-semibold text-slate-900">{product.product_name} <span className="font-normal text-slate-600">· {formatCurrency(product.product_price)}</span></p>
          {product.call_to_action && <p className="mt-1 whitespace-pre-wrap break-words text-slate-600">{product.call_to_action}</p>}
        </li>)}</ul>
      </section>}
      {video && <Button asChild variant="outline"><a href={video} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Assistir ao vídeo</a></Button>}
    </div>}
  </DetailsDialog>;
}
