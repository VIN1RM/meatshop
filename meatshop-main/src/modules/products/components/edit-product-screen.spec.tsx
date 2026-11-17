import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { EditProductScreen } from './edit-product-screen';
import { apiPatch } from '@/shared/lib/api';

jest.mock('next/navigation', () => ({ useParams: () => ({ id: '53' }) }));
jest.mock('@/shared/lib/query-cache', () => ({ peekApiData: () => undefined }));
jest.mock('@/shared/lib/api', () => ({
  apiGet: jest.fn(async (path: string) => path.startsWith('/categories')
    ? [{ id: 1, name: 'Carnes' }]
    : { product: { id: 53, name: 'Filé', price: '89.90', unit_of_measure: 'kg', active: true, unit_id: 9, category_id: 1 }, stock: { quantity: '32.000', min_quantity: '8.000' }, images: [] }),
  apiPatch: jest.fn(async () => ({})), apiDelete: jest.fn(), apiUpload: jest.fn(), resolveAssetUrl: (value: string) => value,
}));

describe('Editing stock decimals from the API', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(async () => {
    jest.clearAllMocks();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(<EditProductScreen />));
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

  it('shows normalized quantities and saves without an unintended stock adjustment', async () => {
    expect(container.querySelector<HTMLInputElement>('#field-edit-product-screen-9297')?.value).toBe('32');
    expect(container.querySelector<HTMLInputElement>('#field-edit-product-screen-9836')?.value).toBe('8');
    const button = Array.from(container.querySelectorAll('button')).find(item => item.textContent === 'Salvar alterações')!;
    await act(async () => button.click());
    expect(apiPatch).toHaveBeenCalledTimes(1);
    expect(apiPatch).toHaveBeenCalledWith('/products/53', expect.objectContaining({ price: 89.9 }));
  });
});
