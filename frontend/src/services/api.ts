/**
 * Central API Client for FinMate 2.0.
 * Connects to FastAPI Backend (PostgreSQL/SQLite) and Node.js Microservice (MongoDB).
 */

import {
  AdminStats,
  AdminUserItem,
  AnalyticsSummary,
  AuditLogItem,
  AuthUser,
  Budget,
  ConversationItem,
  DataQualitySummary,
  FinancialProfile,
  Goal,
  ImportSummaryResult,
  Income,
  Investment,
  NoteItem,
  NotificationItem,
  RecurringPayment,
  Subscription,
  SystemHealth,
  TokenResponse,
  Transaction,
  TransactionCategory,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const NODE_BASE_URL =
  import.meta.env.VITE_NODE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('finmate_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error && errJson.error.message) {
        errorMsg = errJson.error.message;
      } else if (errJson.detail) {
        errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // Ignore JSON parse error on non-json response
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

// Request to Node.js Microservice (MongoDB document operations)
async function nodeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${NODE_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMsg = `Node Service Error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.error && errJson.error.message) {
          errorMsg = errJson.error.message;
        }
      } catch {}
      throw new Error(errorMsg);
    }
    return response.json() as Promise<T>;
  } catch (err: any) {
    // If Node.js service is unreachable, fallback to client-safe error notice
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Node.js Document Service (port 5000) is starting or unreachable.');
    }
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; service: string; database: string }>('/health'),
  checkNodeHealth: () =>
    nodeRequest<{ status: string; service: string; database: string; mongoConnected?: boolean }>('/api/health'),

  // Auth & RBAC
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    request<TokenResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  googleLogin: (data: { credential?: string; email?: string; name?: string }) =>
    request<TokenResponse>('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<AuthUser>('/api/v1/auth/me'),
  updateAuthProfile: (data: { name?: string; email?: string }) =>
    request<AuthUser>('/api/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (data: { old_password: string; new_password: string }) =>
    request<{ message: string }>('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics & Data Quality
  getAnalyticsSummary: () => request<AnalyticsSummary>('/api/v1/analytics/summary'),
  getDataQualitySummary: () => request<DataQualitySummary>('/api/v1/data-quality/summary'),

  // Categories
  getCategories: () => request<TransactionCategory[]>('/api/v1/categories'),
  createCategory: (data: { name: string; category_type: string; description?: string }) =>
    request<TransactionCategory>('/api/v1/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Transactions
  getTransactions: (params?: { transaction_type?: string; category?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params?.transaction_type) query.append('transaction_type', params.transaction_type);
    if (params?.category) query.append('category', params.category);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    return request<{ items: Transaction[]; total: number; page: number; total_pages: number }>(
      `/api/v1/transactions?${query.toString()}`
    );
  },
  createTransaction: (data: Partial<Transaction>) =>
    request<Transaction>('/api/v1/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTransaction: (id: string, data: Partial<Transaction>) =>
    request<Transaction>(`/api/v1/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id: string) =>
    request<{ message: string }>(`/api/v1/transactions/${id}`, {
      method: 'DELETE',
    }),

  // Budgets
  getBudgets: () => request<Budget[]>('/api/v1/budgets'),
  createBudget: (data: { category: string; amount: number; period?: string; alert_threshold?: number }) =>
    request<Budget>('/api/v1/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBudget: (id: string, data: Partial<Budget>) =>
    request<Budget>(`/api/v1/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBudget: (id: string) =>
    request<{ message: string }>(`/api/v1/budgets/${id}`, {
      method: 'DELETE',
    }),

  // Incomes
  getIncomes: (params?: { source?: string; start_date?: string; end_date?: string }) => {
    const query = new URLSearchParams();
    if (params?.source) query.append('source', params.source);
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    return request<Income[]>(`/api/v1/incomes?${query.toString()}`);
  },
  createIncome: (data: Partial<Income>) =>
    request<Income>('/api/v1/incomes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateIncome: (id: string, data: Partial<Income>) =>
    request<Income>(`/api/v1/incomes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteIncome: (id: string) =>
    request<{ message: string }>(`/api/v1/incomes/${id}`, {
      method: 'DELETE',
    }),

  // Subscriptions
  getSubscriptions: () => request<Subscription[]>('/api/v1/subscriptions'),
  createSubscription: (data: Partial<Subscription>) =>
    request<Subscription>('/api/v1/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSubscription: (id: string, data: Partial<Subscription>) =>
    request<Subscription>(`/api/v1/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSubscription: (id: string) =>
    request<{ message: string }>(`/api/v1/subscriptions/${id}`, {
      method: 'DELETE',
    }),

  // Recurring Payments
  getRecurringPayments: () => request<RecurringPayment[]>('/api/v1/recurring'),
  createRecurringPayment: (data: Partial<RecurringPayment>) =>
    request<RecurringPayment>('/api/v1/recurring', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRecurringPayment: (id: string, data: Partial<RecurringPayment>) =>
    request<RecurringPayment>(`/api/v1/recurring/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteRecurringPayment: (id: string) =>
    request<{ message: string }>(`/api/v1/recurring/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/v1/notifications'),
  markNotificationRead: (id: string) =>
    request<NotificationItem>(`/api/v1/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request<{ message: string }>('/api/v1/notifications/read-all', {
      method: 'PUT',
    }),
  deleteNotification: (id: string) =>
    request<{ message: string }>(`/api/v1/notifications/${id}`, {
      method: 'DELETE',
    }),

  // Goals
  getGoals: () => request<Goal[]>('/api/v1/goals'),
  createGoal: (data: Partial<Goal>) =>
    request<Goal>('/api/v1/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGoal: (id: string, data: Partial<Goal>) =>
    request<Goal>(`/api/v1/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGoal: (id: string) =>
    request<{ message: string }>(`/api/v1/goals/${id}`, {
      method: 'DELETE',
    }),

  // Investments
  getInvestments: () => request<Investment[]>('/api/v1/investments'),
  createInvestment: (data: Partial<Investment>) =>
    request<Investment>('/api/v1/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteInvestment: (id: string) =>
    request<{ message: string }>(`/api/v1/investments/${id}`, {
      method: 'DELETE',
    }),

  // Profile
  getProfile: () => request<FinancialProfile>('/api/v1/profile'),
  updateProfile: (data: Partial<FinancialProfile>) =>
    request<FinancialProfile>('/api/v1/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin Workspace
  getAdminStats: () => request<AdminStats>('/api/v1/admin/stats'),
  getAdminUsers: () => request<AdminUserItem[]>('/api/v1/admin/users'),
  updateUserRole: (userId: string, role: string) =>
    request<{ message: string }>(`/api/v1/admin/users/${userId}/role?role=${role}`, {
      method: 'PUT',
    }),
  getAuditLogs: () => request<AuditLogItem[]>('/api/v1/admin/audit-logs'),
  getSystemHealth: () => request<SystemHealth>('/api/v1/admin/system'),

  // Export URLs
  getExportTransactionsCsvUrl: () => '/api/v1/export/transactions/csv',
  getExportReportJsonUrl: () => '/api/v1/export/report/json',

  // CSV Imports
  previewCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ImportSummaryResult>('/api/v1/imports/transactions/preview', {
      method: 'POST',
      body: formData,
    });
  },
  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ImportSummaryResult>('/api/v1/imports/transactions', {
      method: 'POST',
      body: formData,
    });
  },

  // AI & ML Intelligence
  classifyTransaction: (data: { description: string; amount?: number | string; transaction_type?: string }) =>
    request<import('../types').TransactionClassificationResult>('/api/v1/ai/classify-transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  forecastExpenses: (data: { recent_lags?: number[]; forecast_month?: number } = {}) =>
    request<import('../types').ExpenseForecastResult>('/api/v1/ai/forecast-expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  checkAnomaly: (data: { amount: number | string; category: string; is_weekend?: boolean }) =>
    request<import('../types').AnomalyCheckResult>('/api/v1/ai/anomaly-check', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  retrieveGuidance: (query: string, top_k: number = 3) =>
    request<import('../types').RAGRetrieveResult>('/api/v1/ai/retrieve', {
      method: 'POST',
      body: JSON.stringify({ query, top_k }),
    }),
  askFinMate: (question: string, include_financial_context: boolean = true) =>
    request<import('../types').AIAskResult>('/api/v1/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question, include_financial_context }),
    }),
  getModelRegistry: () =>
    request<import('../types').ModelRegistryResult>('/api/v1/ai/models'),

  // Multi-Agent Decision APIs
  createAgentTask: (query: string, user_id?: string) =>
    request<import('../types').AgentTaskResult>('/api/v1/agent/tasks', {
      method: 'POST',
      body: JSON.stringify({ query, user_id }),
    }),
  getAgentTask: (taskId: string) =>
    request<import('../types').AgentTaskResult>(`/api/v1/agent/tasks/${taskId}`),
  getAgentTrace: (taskId: string) =>
    request<import('../types').ExecutionStepItem[]>(`/api/v1/agent/tasks/${taskId}/trace`),
  getPendingApprovals: () =>
    request<import('../types').AgentApprovalItem[]>('/api/v1/agent/approvals/pending'),
  approveAgentAction: (taskId: string, approvalId: string) =>
    request<{ approval_id: string; task_id: string; status: string; message: string }>(
      `/api/v1/agent/tasks/${taskId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ approval_id: approvalId }),
      }
    ),
  rejectAgentAction: (taskId: string, approvalId: string) =>
    request<{ approval_id: string; task_id: string; status: string; message: string }>(
      `/api/v1/agent/tasks/${taskId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ approval_id: approvalId }),
      }
    ),
  cancelAgentTask: (taskId: string) =>
    request<{ task_id: string; status: string; message: string }>(
      `/api/v1/agent/tasks/${taskId}/cancel`,
      { method: 'POST' }
    ),
  getAgentTools: () =>
    request<import('../types').AgentToolItem[]>('/api/v1/agent/tools'),

  // Financial Decision & Simulation APIs
  simulateDecision: (payload: import('../types').DecisionSimulateRequest) =>
    request<import('../types').DecisionSimulationResponse>('/api/v1/decisions/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  compareScenarios: (simulation: import('../types').DecisionSimulationResponse) =>
    request<import('../types').ScenarioCompareResponse>('/api/v1/decisions/compare', {
      method: 'POST',
      body: JSON.stringify({ simulation }),
    }),
  getDecisions: (page = 1, pageSize = 20) =>
    request<{ items: import('../types').DecisionListItem[]; total: number; page: number; total_pages: number }>(
      `/api/v1/decisions?page=${page}&page_size=${pageSize}`
    ),
  getDecision: (decisionId: string) =>
    request<import('../types').DecisionDetailResponse>(`/api/v1/decisions/${decisionId}`),
  deleteDecision: (decisionId: string) =>
    request<{ message: string; success: boolean }>(`/api/v1/decisions/${decisionId}`, {
      method: 'DELETE',
    }),

  // Node.js + MongoDB Document REST APIs (Lab Rubric)
  getNotes: (params?: { search?: string; tag?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.tag) query.append('tag', params.tag);
    return nodeRequest<{ success: boolean; data: NoteItem[]; count: number }>(`/api/notes?${query.toString()}`);
  },
  createNote: (data: { title: string; content: string; tags?: string[]; pinned?: boolean; color?: string }) =>
    nodeRequest<{ success: boolean; data: NoteItem; message: string }>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNote: (id: string, data: Partial<NoteItem>) =>
    nodeRequest<{ success: boolean; data: NoteItem; message: string }>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNote: (id: string) =>
    nodeRequest<{ success: boolean; message: string }>(`/api/notes/${id}`, {
      method: 'DELETE',
    }),

  getConversations: () =>
    nodeRequest<{ success: boolean; data: ConversationItem[]; count: number }>('/api/conversations'),
  createConversation: (data: { title: string; messages?: any[] }) =>
    nodeRequest<{ success: boolean; data: ConversationItem; message: string }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  appendConversationMessage: (id: string, newMessage: { role: string; content: string }) =>
    nodeRequest<{ success: boolean; data: ConversationItem; message: string }>(`/api/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ newMessage }),
    }),
  deleteConversation: (id: string) =>
    nodeRequest<{ success: boolean; message: string }>(`/api/conversations/${id}`, {
      method: 'DELETE',
    }),
};
