'use client';

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge, Button } from '@codedpixels/ui';
import type { FeatureId, Product } from '@codedpixels/shared-types';

import { FeatureUpgradeCta } from '@/components/dashboard/FeatureUpgradeCta';
import { manageProduct, type ManageProductInput } from '@/lib/callables';
import { hasEcommerce } from '@/lib/features/has-feature';
import { getFirebaseFirestore } from '@/lib/firebase';
import {
  formatPricePence,
  MOCK_PRODUCTS,
  slugifyProductName,
  type ProductWithId,
} from '@/lib/products/types';

interface ProductsEditorProps {
  companyId: string;
  siteId: string;
  featureIds: readonly FeatureId[];
  isMock: boolean;
}

const EMPTY_FORM: ManageProductInput = {
  name: '',
  slug: '',
  pricePence: 0,
  status: 'draft',
  sortOrder: 0,
};

export function ProductsEditor({
  companyId,
  siteId,
  featureIds,
  isMock,
}: ProductsEditorProps) {
  const ecommerceEnabled = hasEcommerce(featureIds);
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ManageProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ecommerceEnabled) {
      setLoading(false);
      return;
    }

    if (isMock) {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
      return;
    }

    const db = getFirebaseFirestore();
    const productsQuery = query(
      collection(db, 'companies', companyId, 'sites', siteId, 'products'),
      orderBy('sortOrder'),
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(
          snapshot.docs.map((productDoc) => ({
            id: productDoc.id,
            ...(productDoc.data() as Product),
          })),
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [companyId, ecommerceEnabled, isMock, siteId]);

  function startCreate() {
    setEditingId('new');
    setForm({ ...EMPTY_FORM, sortOrder: products.length });
    setError(null);
  }

  function startEdit(product: ProductWithId) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      pricePence: product.pricePence,
      sku: product.sku,
      status: product.status,
      sortOrder: product.sortOrder,
    });
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        slug: form.slug || slugifyProductName(form.name),
        sortOrder: form.sortOrder ?? 0,
      };

      if (isMock) {
        if (editingId === 'new') {
          const id = `mock-product-${Date.now()}`;
          setProducts((current) => [
            ...current,
            {
              id,
              ...payload,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        } else if (editingId) {
          setProducts((current) =>
            current.map((product) =>
              product.id === editingId
                ? {
                    ...product,
                    ...payload,
                    updatedAt: new Date().toISOString(),
                  }
                : product,
            ),
          );
        }
        setEditingId(null);
        setForm(EMPTY_FORM);
        return;
      }

      if (editingId === 'new') {
        await manageProduct({ action: 'create', siteId, product: payload });
      } else if (editingId) {
        await manageProduct({
          action: 'update',
          siteId,
          productId: editingId,
          product: payload,
        });
      }

      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Could not save product',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    if (isMock) {
      setProducts((current) => current.filter((product) => product.id !== productId));
      return;
    }

    await manageProduct({ action: 'delete', siteId, productId });
  }

  if (!ecommerceEnabled) {
    return (
      <FeatureUpgradeCta
        featureId="ecommerce"
        title="Unlock product management"
        description="Upgrade to Ecommerce Store to create products and use shop sections on your live site."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={startCreate}>Add product</Button>
      </div>

      <div className="overflow-x-auto rounded-card border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  Loading products…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No products yet. Add your first product to get started.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-text">{product.name}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatPricePence(product.pricePence)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.status === 'published' ? 'success' : 'primary'}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => startEdit(product)}>
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void handleDelete(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingId ? (
        <form
          className="space-y-4 rounded-card border border-border bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <h2 className="text-lg font-semibold text-text">
            {editingId === 'new' ? 'New product' : 'Edit product'}
          </h2>

          <label className="block text-sm">
            <span className="text-text-muted">Name</span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                  slug:
                    current.slug || slugifyProductName(event.target.value),
                }))
              }
              className="builder-focus-ring mt-1 block w-full rounded-card border border-border px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-text-muted">Slug</span>
            <input
              required
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
              className="builder-focus-ring mt-1 block w-full rounded-card border border-border px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-text-muted">Price (pence)</span>
            <input
              required
              type="number"
              min={0}
              value={form.pricePence}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  pricePence: Number(event.target.value),
                }))
              }
              className="builder-focus-ring mt-1 block w-full rounded-card border border-border px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-text-muted">SKU (optional)</span>
            <input
              value={form.sku ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, sku: event.target.value }))
              }
              className="builder-focus-ring mt-1 block w-full rounded-card border border-border px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-text-muted">Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as Product['status'],
                }))
              }
              className="builder-focus-ring mt-1 block w-full rounded-card border border-border px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save product'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
