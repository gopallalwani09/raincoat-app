import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/products`;

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = { category: 'All' }) => {
    let queryParams = typeof params === 'string' ? { category: params } : params;
    const { category = 'All', subcategory, sort, page, limit, search } = queryParams;
    
    const query = new URLSearchParams();
    if (category !== 'All') query.append('category', category);
    if (subcategory && subcategory !== 'All') query.append('subcategory', subcategory);
    if (sort) query.append('sort', sort);
    if (page) query.append('page', page);
    if (limit !== undefined) query.append('limit', limit);
    if (search) query.append('search', search);
    
    const queryString = query.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;

    const response = await axios.get(url);
    if (!response.data || (!Array.isArray(response.data) && !Array.isArray(response.data.products))) {
      throw new Error('Invalid API response. Ensure VITE_API_URL is correctly set to the backend URL.');
    }
    
    if (Array.isArray(response.data)) {
      return { products: response.data, totalPages: 1, currentPage: 1, totalProducts: response.data.length };
    }
    
    return response.data;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { auth: { adminInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminInfo.token}`
        }
      };
      const response = await axios.post(API_URL, formData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, formData }, { getState, rejectWithValue }) => {
    try {
      const { auth: { adminInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminInfo.token}`
        }
      };
      const response = await axios.put(`${API_URL}/${id}`, formData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { adminInfo } } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`
        }
      };
      await axios.delete(`${API_URL}/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting product');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    totalPages: 1,
    currentPage: 1,
    totalProducts: 0,
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products || [];
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
        state.totalProducts = action.payload.totalProducts || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export default productsSlice.reducer;
