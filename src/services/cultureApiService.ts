// API service for Culture
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

interface CultureItemsParams {
    categoryId?: string;
    page?: number;
    limit?: number;
    search?: string;
}

interface MyCultureItemsParams {
    status?: string;
    page?: number;
    limit?: number;
}

interface AdminCultureItemsParams {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
}

class CultureApiService {
    // Lấy danh sách categories
    static async getCategories() {
        try {
            const response = await fetch(`${BASE_URL}/culture/categories`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy danh sách categories');
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    // Lấy danh sách culture items
    static async getCultureItems(params: CultureItemsParams = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.categoryId) queryParams.append('categoryId', params.categoryId);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.search) queryParams.append('search', params.search);

            const response = await fetch(`${BASE_URL}/culture/items?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy danh sách nội dung văn hóa');
        } catch (error) {
            console.error('Error fetching culture items:', error);
            throw error;
        }
    }

    // Lấy chi tiết culture item
    static async getCultureItem(id: string) {
        try {
            const response = await fetch(`${BASE_URL}/culture/items/${id}`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy chi tiết nội dung');
        } catch (error) {
            console.error('Error fetching culture item:', error);
            throw error;
        }
    }

    // Tạo culture item mới (teacher)
    static async createCultureItem(itemData: any, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/culture/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi tạo nội dung văn hóa');
        } catch (error) {
            console.error('Error creating culture item:', error);
            throw error;
        }
    }

    // Cập nhật culture item (teacher)
    static async updateCultureItem(id: string, itemData: any, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/culture/items/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi cập nhật nội dung');
        } catch (error) {
            console.error('Error updating culture item:', error);
            throw error;
        }
    }

    // Gửi để duyệt (teacher)
    static async submitForApproval(id: string, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/culture/items/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data;
            }
            throw new Error(data.message || 'Lỗi khi gửi nội dung để duyệt');
        } catch (error) {
            console.error('Error submitting for approval:', error);
            throw error;
        }
    }

    // Lấy danh sách nội dung của teacher
    static async getMyCultureItems(params: MyCultureItemsParams = {}, token: string) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());

            const response = await fetch(`${BASE_URL}/culture/my-items?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy danh sách nội dung của tôi');
        } catch (error) {
            console.error('Error fetching my culture items:', error);
            throw error;
        }
    }

    // Xóa culture item (teacher)
    static async deleteCultureItem(id: string, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/culture/items/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data;
            }
            throw new Error(data.message || 'Lỗi khi xóa nội dung');
        } catch (error) {
            console.error('Error deleting culture item:', error);
            throw error;
        }
    }

    // === ADMIN METHODS ===

    // Lấy danh sách culture items cho admin
    static async getCultureItemsForAdmin(params: AdminCultureItemsParams = {}, token: string) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.search) queryParams.append('search', params.search);

            const response = await fetch(`${BASE_URL}/culture/admin/items?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy danh sách cho admin');
        } catch (error) {
            console.error('Error fetching culture items for admin:', error);
            throw error;
        }
    }

    // Duyệt culture item (admin)
    static async approveCultureItem(id: string, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/culture/admin/items/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data;
            }
            throw new Error(data.message || 'Lỗi khi duyệt nội dung');
        } catch (error) {
            console.error('Error approving culture item:', error);
            throw error;
        }
    }

    // Từ chối culture item (admin)
    static async rejectCultureItem(id: string, rejectionReason: string, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/culture/admin/items/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rejectionReason })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data;
            }
            throw new Error(data.message || 'Lỗi khi từ chối nội dung');
        } catch (error) {
            console.error('Error rejecting culture item:', error);
            throw error;
        }
    }
}

export default CultureApiService;