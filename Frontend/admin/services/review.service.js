import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { REVIEWS_MOCK } from './mocks/reviews.mock.js';

let localReviews = [...REVIEWS_MOCK];

export const ReviewService = {
  async list() {
    if (CONFIG.USE_MOCKS) {
      return { results: [...localReviews] };
    }
    try {
      return await api.get('/reviews/');
    } catch (e) {
      console.warn('[ReviewService] API no disponible, usando mocks:', e);
      return { results: [...localReviews] };
    }
  },

  async toggleFeatured(id, isFeatured) {
    if (CONFIG.USE_MOCKS) {
      const idx = localReviews.findIndex(r => r.id == id);
      if (idx !== -1) {
        localReviews[idx].is_featured = isFeatured;
        return localReviews[idx];
      }
      return null;
    }
    try {
      return await api.patch(`/reviews/${id}/`, { is_featured: isFeatured });
    } catch (e) {
      const idx = localReviews.findIndex(r => r.id == id);
      if (idx !== -1) {
        localReviews[idx].is_featured = isFeatured;
        return localReviews[idx];
      }
      return null;
    }
  },

  async updateStatus(id, status) {
    if (CONFIG.USE_MOCKS) {
      const idx = localReviews.findIndex(r => r.id == id);
      if (idx !== -1) {
        localReviews[idx].status = status;
        return localReviews[idx];
      }
      return null;
    }
    try {
      return await api.patch(`/reviews/${id}/`, { status });
    } catch (e) {
      const idx = localReviews.findIndex(r => r.id == id);
      if (idx !== -1) {
        localReviews[idx].status = status;
        return localReviews[idx];
      }
      return null;
    }
  },

  async delete(id) {
    if (CONFIG.USE_MOCKS) {
      localReviews = localReviews.filter(r => r.id != id);
      return { success: true };
    }
    try {
      return await api.delete(`/reviews/${id}/`);
    } catch (e) {
      localReviews = localReviews.filter(r => r.id != id);
      return { success: true };
    }
  }
};
