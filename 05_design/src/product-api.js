import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export async function fetchProducts() {
  const { data } = await api.get('/products/')
  return data
}

export async function createProduct(payload) {
  const { data } = await api.post('/products/', payload)
  return data
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`)
  return data
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`)
  return data
}

// Cart API
export async function fetchCart() {
  const { data } = await api.get('/cart/')
  return data
}

export async function addToCart(productId) {
  const { data } = await api.post(`/cart/${productId}`)
  return data
}

export async function updateCartItem(productId, quantity) {
  const { data } = await api.put(`/cart/${productId}`, { quantity })
  return data
}

export async function removeCartItem(productId) {
  const { data } = await api.delete(`/cart/${productId}`)
  return data
}
