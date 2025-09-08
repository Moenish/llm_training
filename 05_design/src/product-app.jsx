import React, { useEffect, useMemo, useState } from 'react'
import { PlusIcon, EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ProductDialogs } from './product-dialogs'
import { fetchProducts } from './product-api'

export function ProductApp() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dialog, setDialog] = useState(null) // { type: 'new'|'edit'|'details'|'delete', product? }

  const load = async () => {
    try {
      setLoading(true)
      setProducts(await fetchProducts())
    } catch (e) {
      setError(e.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const open = (type, product) => setDialog({ type, product })
  const close = () => setDialog(null)

  useEffect(() => {
    const handler = () => close()
    document.addEventListener('close-product-dialog', handler)
    return () => document.removeEventListener('close-product-dialog', handler)
  }, [])

  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => [p.name, p.description].filter(Boolean).some(v => v.toLowerCase().includes(q)))
  }, [products, query])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
          <h1 className="app-title">Products</h1>
          <div className="w-full flex items-center gap-4 justify-between mt-2">
            <input
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input w-full max-w-md"
            />
            <button onClick={() => open('new')} className="btn-dark gap-2 whitespace-nowrap">
              <PlusIcon className="h-5 w-5" />
              <span>Create</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
          {loading && <div className="text-sm text-gray-500">Loading products...</div>}
          {error && <div className="text-sm text-danger">{error}</div>}

          {!loading && filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-4">
              <p className="text-gray-600 text-sm">No products match your search.</p>
              <button onClick={() => open('new')} className="btn-dark">Add your first product</button>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 fade-in">
              {filtered.map(p => (
                <ProductCard key={p.id} p={p} onOpen={open} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ProductDialogs state={dialog} onClose={close} onChanged={async () => { close(); await load() }} />
    </div>
  )
}

function ProductCard({ p, onOpen }) {
  return (
    <div className="card group">
      <div className="flex items-start gap-3 pr-2">
        <div className="flex-1 min-w-0">
          <h3 className="card-title line-clamp-1" title={p.name}>{p.name}</h3>
          <p className="card-meta truncate-2 mt-1" title={p.description}>{p.description || 'No description'}</p>
        </div>
      </div>
      <div className="card-footer flex-col justify-start items-stretch gap-3 text-xs text-gray-600">
        <div className="flex w-full items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">${p.price}</span>
          <span className="font-medium">Stock: {p.stock}</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button onClick={() => onOpen('details', p)} className="btn-ghost gap-1 text-primary-600" aria-label="Details">
            <EyeIcon className="h-5 w-5" />
            <span className="hidden md:inline">Details</span>
          </button>
          <button onClick={() => onOpen('edit', p)} className="btn-ghost gap-1 text-accent" aria-label="Edit">
            <PencilSquareIcon className="h-5 w-5" />
            <span className="hidden md:inline">Edit</span>
          </button>
          <button onClick={() => onOpen('delete', p)} className="btn-danger-icon" aria-label="Delete">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
