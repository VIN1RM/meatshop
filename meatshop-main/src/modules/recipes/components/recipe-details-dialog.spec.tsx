import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { RecipeDetailsDialog } from './recipe-details-dialog';
import { useApiQuery } from '@/shared/hooks/use-api-query';

jest.mock('@/shared/hooks/use-api-query', () => ({ useApiQuery: jest.fn() }));
jest.mock('@/shared/lib/api', () => ({ resolveAssetUrl: (url: string) => url }));

describe('Recipe details', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

  it('loads authenticated details, shows ingredients and sorts preparation steps', async () => {
    const onClose = jest.fn();
    jest.mocked(useApiQuery).mockReturnValue({ data: {
      title: 'Picanha com ervas', active: false, description: 'Receita da família', tag: 'Bovinos',
      ingredients: [{ id: 1, name: 'Picanha', quantity: '1 kg', tip: 'Retire o excesso de gordura' }],
      steps: [{ id: 2, step_number: 2, description: 'Asse a carne', tip: 'Deixe descansar' }, { id: 1, step_number: 1, description: 'Tempere a carne', tip: null }],
      products: [{ id: 1, product_name: 'Picanha especial', product_price: 59.9, call_to_action: 'Veja no catálogo' }],
      video_url: 'javascript:alert(1)',
    }, isPending: false } as never);
    await act(async () => root.render(<RecipeDetailsDialog recipeId={12} onClose={onClose} />));
    expect(useApiQuery).toHaveBeenCalledWith('/recipes/manage/12');
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('Inativa');
    expect(dialog.textContent).toContain('1 kg Picanha');
    expect(dialog.textContent).toContain('Deixe descansar');
    expect(dialog.textContent).toContain('Picanha especial');
    const steps = dialog.querySelector('ol')!.textContent!;
    expect(steps.indexOf('Tempere')).toBeLessThan(steps.indexOf('Asse'));
    expect(dialog.querySelector('a')).toBeNull();
    const close = Array.from(dialog.querySelectorAll('button')).find(button => button.textContent === 'Fechar')!;
    await act(async () => close.click());
    expect(onClose).toHaveBeenCalled();
  });

  it('allows retrying failed requests', async () => {
    const refetch = jest.fn();
    jest.mocked(useApiQuery).mockReturnValue({ error: new Error('offline'), isPending: false, refetch } as never);
    await act(async () => root.render(<RecipeDetailsDialog recipeId={12} onClose={jest.fn()} />));
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('Não foi possível');
    const retry = Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Tentar novamente')!;
    await act(async () => retry.click());
    expect(refetch).toHaveBeenCalled();
  });
});
