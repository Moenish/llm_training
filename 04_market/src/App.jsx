import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import './App.css';


const API_BASE = 'http://localhost:8000/products'; // Update if backend runs elsewhere

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setProducts(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setSnackbar({ open: true, message: 'Product deleted', severity: 'success' });
      fetchProducts();
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
    }
    setLoading(false);
  };

  // Add/Edit product
  const handleDialogOpen = (product = null) => {
    setEditMode(!!product);
    setForm(product ? { ...product, price: product.price.toString(), stock: product.stock.toString() } : { name: '', description: '', price: '', stock: '' });
    setDialogOpen(true);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      // Convert price and stock to correct types
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10)
      };
      if (editMode) {
        await axios.put(`${API_BASE}/${form.id}`, payload);
        setSnackbar({ open: true, message: 'Product updated', severity: 'success' });
      } else {
        await axios.post(API_BASE, payload);
        setSnackbar({ open: true, message: 'Product added', severity: 'success' });
      }
      fetchProducts();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to save product', severity: 'error' });
    }
    setLoading(false);
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Market Products
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleDialogOpen()}>
            Add Product
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {products.map((product) => (
              <ListItem key={product.id} disablePadding sx={{ mb: 2 }}>
                <Paper elevation={3} sx={{ width: '100%', borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', boxShadow: 3 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Price: ${product.price} &nbsp;|&nbsp; Stock: {product.stock}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleDialogOpen(product)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(product.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </ListItem>
            ))}
          </List>
        )}
        {selectedProduct && (
          <Box sx={{ mt: 4, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
            <Typography variant="h5">{selectedProduct.name}</Typography>
            <Typography variant="body1">{selectedProduct.description}</Typography>
            <Typography variant="subtitle1">Price: ${selectedProduct.price}</Typography>
          </Box>
        )}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>{editMode ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              name="name"
              fullWidth
              value={form.name ?? ""}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              label="Description"
              name="description"
              fullWidth
              value={form.description ?? ""}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              label="Price"
              name="price"
              type="number"
              fullWidth
              value={form.price ?? ""}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              label="Stock"
              name="stock"
              type="number"
              fullWidth
              value={form.stock ?? ""}
              onChange={handleFormChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleFormSubmit} variant="contained">
              {editMode ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default App
