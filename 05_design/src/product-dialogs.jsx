import React, { useEffect, useState } from 'react'
import { XMarkIcon, EyeIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { createProduct, updateProduct, deleteProduct, fetchProduct } from './product-api'

export function ProductDialogs({ state, onClose, onChanged }) {
  if (!state) return null
  const { type, product } = state

  const shared = { onClose, product }
  switch (type) {
    case 'new': return <Modal><NewProductForm {...shared} onChanged={onChanged} /></Modal>
    case 'edit': return <Modal><EditProductForm {...shared} onChanged={onChanged} /></Modal>
    case 'details': return <Modal><DetailsDialog {...shared} /></Modal>
    case 'delete': return <Modal><DeleteDialog {...shared} onChanged={onChanged} /></Modal>
    default: return null
  }
}

function Modal({ children }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel relative">
        <button
          type="button"
          aria-label="Close"
          className="absolute top-3 right-3 icon-btn"
          onClick={(e) => { e.stopPropagation(); document.dispatchEvent(new CustomEvent('close-product-dialog')); }}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={htmlFor} className="font-medium text-gray-700">{label}</label>
      {children}
      {error && <span className="field-error" id={`${htmlFor}-error`}>{error}</span>}
    </div>
  )
}

function useProductForm(initial) {
  const [form, setForm] = useState(() => ({
    name: initial.name || '',
    price: initial.price !== undefined ? initial.price : '',
    description: initial.description || '',
    stock: initial.stock !== undefined ? initial.stock : ''
  }))
  const [errors, setErrors] = useState({})
  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.price === '' || isNaN(parseFloat(form.price))) e.price = 'Price is required'
    else if (parseFloat(form.price) < 0) e.price = 'Price must be >= 0'
    if (form.stock === '' || isNaN(parseInt(form.stock))) e.stock = 'Stock is required'
    else if (parseInt(form.stock) < 0) e.stock = 'Stock must be >= 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  return { form, setForm, errors, validate }
}

function ProductForm({ mode, initial = {}, onSubmit, onClose, saving }) {
  const { form, setForm, errors, validate } = useProductForm(initial)
  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      name: form.name.trim(),
      price: parseFloat(form.price),
      description: form.description.trim(),
      stock: parseInt(form.stock)
    })
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="modal-title">{mode === 'new' ? 'New Product' : 'Edit Product'}</h2>
        <p className="text-xs text-gray-500">{mode === 'new' ? 'Create a new product entry.' : 'Update product details.'}</p>
      </div>
      <div className="flex flex-col gap-5">
        <Field label="Name" htmlFor="name" error={errors.name}>
          <input id="name" aria-describedby={errors.name ? 'name-error' : undefined} required className="input input-muted" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description}>
          <textarea id="description" className="input input-muted" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Price" htmlFor="price" error={errors.price}>
            <input id="price" aria-describedby={errors.price ? 'price-error' : undefined} required type="number" step="0.01" className="input input-muted" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </Field>
          <Field label="Stock" htmlFor="stock" error={errors.stock}>
            <input id="stock" aria-describedby={errors.stock ? 'stock-error' : undefined} required type="number" className="input input-muted" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </Field>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
  <button disabled={saving} className="btn-dark gap-2">{saving ? (mode === 'new' ? 'Creating…' : 'Saving…') : (
          <>{mode === 'new' ? <PlusIcon className="h-5 w-5" /> : <PencilSquareIcon className="h-5 w-5" />}<span>{mode === 'new' ? 'Create' : 'Save'}</span></>
        )}</button>
      </div>
    </form>
  )
}

function NewProductForm({ onClose, onChanged }) {
  const [saving, setSaving] = useState(false)
  const handle = async (data) => {
    setSaving(true)
    await createProduct(data)
    setSaving(false)
    onChanged()
  }
  return <ProductForm mode="new" saving={saving} onSubmit={handle} onClose={onClose} />
}

function EditProductForm({ product, onClose, onChanged }) {
  const [saving, setSaving] = useState(false)
  const handle = async (data) => {
    setSaving(true)
    await updateProduct(product.id, data)
    setSaving(false)
    onChanged()
  }
  return <ProductForm mode="edit" initial={product} saving={saving} onSubmit={handle} onClose={onClose} />
}

function DetailsDialog({ product, onClose }) {
  const [full, setFull] = useState(product)
  const [loading, setLoading] = useState(!product.description)
  useEffect(() => { (async () => { setLoading(true); const data = await fetchProduct(product.id); setFull(data); setLoading(false) })() }, [product.id])
  return (
    <div className="flex flex-col gap-6">
      <h2 className="modal-title">Product Details</h2>
      {loading ? (
        <div className="text-sm text-gray-500 animate-pulse">Loading details…</div>
      ) : (
        <div className="space-y-6">
          <div className="text-base font-medium text-gray-900 break-words">{full.name}</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {full.description || 'No description provided.'}
          </div>
          <div className="border-t border-gray-200 pt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="detail-label">Price</span>
                <span className="text-sm font-semibold text-gray-900">${full.price}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="detail-label">Stock</span>
                <span className="text-sm font-semibold text-gray-900">{full.stock}</span>
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-wide text-gray-500 flex items-center gap-2">
              <span>ID</span>
              <span className="font-mono text-gray-700">{full.id}</span>
            </div>
            <MetaFooter createdAt={full.created_at} />
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 font-medium break-words">{value}</span>
    </div>
  )
}

function DetailCard({ label, value }) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  )
}

function DetailBlock({ label, value }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">{label}</span>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap min-h-[72px]">{value}</div>
    </div>
  )
}

function MetaFooter({ createdAt }) {
  if (!createdAt) return null
  return (
    <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
      <span>Created</span>
      <time dateTime={createdAt}>{new Date(createdAt).toLocaleString()}</time>
    </div>
  )
}

function DeleteDialog({ product, onClose, onChanged }) {
  const [deleting, setDeleting] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setDeleting(true)
    await deleteProduct(product.id)
    setDeleting(false)
    onChanged()
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <h2 className="modal-title text-danger">Delete Product</h2>
      <p className="text-sm leading-relaxed">Are you sure you want to delete <span className="font-medium">{product.name}</span>? This action cannot be undone.</p>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
  <button disabled={deleting} className="btn-danger gap-2">{deleting ? 'Deleting...' : (<><TrashIcon className="h-5 w-5" /><span>Delete</span></>)}</button>
      </div>
    </form>
  )
}
