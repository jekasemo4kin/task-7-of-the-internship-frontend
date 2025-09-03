import React from 'react';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TagsProvider } from './context/TagsContext';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateInventoryPage from './pages/CreateInventoryPage';
import InventoryDetailPage from './pages/InventoryDetailPage';
import MyInventoriesPage from './pages/MyInventoriesPage';
import ProtectedRoute from './components/ProtectedRoute';
import ItemDetailPage from './pages/ItemDetailPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';
import AuthSuccessPage from './pages/AuthSuccessPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TagsProvider>
          <div className="bg-gray-100 min-h-screen">
            <Header />
            <main className="py-8">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/inventories/:id" element={<InventoryDetailPage />} />
                <Route path="/inventories/:id/:tab" element={<InventoryDetailPage />} />
                <Route path="/inventories/:id/items/:itemId" element={<ItemDetailPage  />} />
                <Route path="/auth/success" element={<AuthSuccessPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/my-inventories" element={<MyInventoriesPage />} />
                  <Route path="/inventories/new" element={<CreateInventoryPage />} />
                </Route>
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Routes>
            </main>
          </div>
        </TagsProvider>
      </AuthProvider>
    </Router>
  );
}
export default App;