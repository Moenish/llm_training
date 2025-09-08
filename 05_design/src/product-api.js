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
