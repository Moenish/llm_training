import React, { useEffect, useMemo, useState } from 'react'
import { PlusIcon, EyeIcon, PencilSquareIcon, TrashIcon, ShoppingCartIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ProductDialogs } from './product-dialogs'
import { fetchProducts, fetchCart, addToCart, updateCartItem, removeCartItem } from './product-api'

export function ProductApp() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dialog, setDialog] = useState(null) // { type: 'new'|'edit'|'details'|'delete', product? }
  const [cart, setCart] = useState([])
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState(null)

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

  const loadCart = async () => {
    try {
      setCartLoading(true)
      setCart(await fetchCart())
    } catch (e) {
      setCartError(e.message || 'Failed to load cart')
    } finally {
      setCartLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { loadCart() }, [])

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

  const [toasts, setToasts] = useState([])
  const pushToast = (msg, tone = 'error') => {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(t => [...t, { id, msg, tone }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

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
                <ProductCard key={p.id} p={p} onOpen={open} onAdd={async () => {
                  try {
                    await addToCart(p.id)
                    await Promise.all([load(), loadCart()])
                    pushToast('Added to cart', 'success')
                  } catch (e) {
                    pushToast(e.message || 'Failed to add to cart')
                  }
                }} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CartPanel cart={cart} loading={cartLoading} error={cartError} onReload={loadCart} onChange={async (productId, quantity) => {
        try {
          if (quantity <= 0) {
            await removeCartItem(productId)
          } else {
            await updateCartItem(productId, quantity)
          }
          await Promise.all([load(), loadCart()])
          pushToast('Cart updated', 'success')
        } catch (e) {
          pushToast(e.message || 'Cart update failed')
        }
      }} onRemove={async (productId) => {
        try {
          await removeCartItem(productId)
          await Promise.all([load(), loadCart()])
          pushToast('Removed from cart', 'success')
        } catch (e) {
          pushToast(e.message || 'Remove failed')
        }
      }} />

      <ProductDialogs state={dialog} onClose={close} onChanged={async () => { close(); await load() }} />
      <ToastHost toasts={toasts} />
    </div>
  )
}

function ProductCard({ p, onOpen, onAdd }) {
  const isOutOfStock = p.stock <= 0
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
          <span className="font-medium flex items-center gap-2">Stock: {p.stock}
            <button disabled={isOutOfStock} onClick={onAdd} className={`btn-icon-small ${isOutOfStock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary-50'}`} title={isOutOfStock ? 'Out of stock' : 'Add to cart'}>
              <PlusIcon className="h-4 w-4" />
            </button>
          </span>
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

function CartPanel({ cart, loading, error, onReload, onChange, onRemove }) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  return (
    <div className="fixed bottom-4 left-4 w-72 max-h-[70vh] flex flex-col shadow-lg rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2 font-medium text-sm"><ShoppingCartIcon className="h-5 w-5" /> Cart</div>
        <button onClick={onReload} className="text-xs text-primary-600 hover:underline">Refresh</button>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-2 text-xs">
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-danger">{error}</div>}
        {!loading && cart.length === 0 && <div className="text-gray-500">Cart empty</div>}
        {cart.map(item => (
          <div key={item.id} className="border rounded p-2 flex flex-col gap-1 bg-white">
            <div className="flex justify-between items-center">
              <span className="font-medium truncate" title={item.product.name}>{item.product.name}</span>
              <button onClick={() => onRemove(item.product.id)} className="text-gray-400 hover:text-danger" aria-label="Remove">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button onClick={() => onChange(item.product.id, item.quantity - 1)} className="btn-icon-small" aria-label="Decrease">
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-2 tabular-nums">{item.quantity}</span>
                <button onClick={() => onChange(item.product.id, item.quantity + 1)} className="btn-icon-small" aria-label="Increase">
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t flex items-center justify-between bg-gray-50 text-sm font-medium">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  )
}

function ToastHost({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className={`px-3 py-2 rounded-md text-sm shadow font-medium border bg-white ${t.tone === 'success' ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}`}>{t.msg}</div>
      ))}
    </div>
  )
}
