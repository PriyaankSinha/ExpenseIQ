import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CategoryModalPayload {
  categoryName: string
  onConfirm?: () => void
}

interface UIState {
  sidebarOpen: boolean
  categoryModal: {
    isOpen: boolean
    categoryName: string
  }
  smartInputLoading: boolean
}

const initialState: UIState = {
  sidebarOpen: true,
  categoryModal: {
    isOpen: false,
    categoryName: '',
  },
  smartInputLoading: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    openCategoryModal(state, action: PayloadAction<CategoryModalPayload>) {
      state.categoryModal.isOpen = true
      state.categoryModal.categoryName = action.payload.categoryName
    },
    closeCategoryModal(state) {
      state.categoryModal.isOpen = false
      state.categoryModal.categoryName = ''
    },
    setSmartInputLoading(state, action: PayloadAction<boolean>) {
      state.smartInputLoading = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  openCategoryModal,
  closeCategoryModal,
  setSmartInputLoading,
} = uiSlice.actions

export default uiSlice.reducer
