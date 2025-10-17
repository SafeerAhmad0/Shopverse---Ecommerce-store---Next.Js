"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import Modal from "@/components/Admin/Modal"
import ProductList from "@/components/Admin/ProductList"
import CategoryList from "@/components/Admin/CategoryList"
import StatsCard from "@/components/Admin/StatsCard"
import AdminHeader from "@/components/Admin/AdminHeader"
import CategoryForm from "@/components/Admin/CategoryForm"
import ProductForm from "@/components/Admin/ProductForm"
import TwoFactorManagement from "@/components/Admin/TwoFactorManagement"

export const dynamic = 'force-dynamic'

interface User {
  id: string
  name: string
  email: string
  role: string
  account_status: string
}

interface Category {
  id: string
  name: string
  image_url?: string
}

interface Product {
  id: string
  title: string
  description_en?: string
  description_ar?: string
  price: number
  stock: number
  category_id?: string
  image_url?: string
  images?: string[]
  tags?: string[]
  specs?: string
  features?: string
  properties?: string
  colors?: string[]
  wood_types?: string[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<"dashboard" | "categories" | "products" | "security">("dashboard")

  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 })
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const [categoryForm, setCategoryForm] = useState({ name: "", image_url: "" })
  const [productForm, setProductForm] = useState({
    title: "", description_en: "", description_ar: "", price: 0, stock: 0,
    category_id: "", image_url: "", images: [] as string[], tags: "",
    specs: "", features: "", properties: "",
    colors: [] as string[], wood_types: [] as string[]
  })
  const [uploading, setUploading] = useState(false)

  const fetchStats = async () => {
    const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })
    const { data: ordersData, count: ordersCount } = await supabase.from("orders").select("total_amount", { count: "exact" })
    const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    setStats({ totalProducts: productsCount || 0, totalOrders: ordersCount || 0, totalRevenue })
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("created_at", { ascending: false })
    setCategories(data || [])
  }

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("in_date", { ascending: false })
    setProducts(data || [])
  }

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push("/admin/login"); return }

      const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()
      if (!userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
        toast.error("Access denied")
        await supabase.auth.signOut()
        router.push("/admin/login")
        return
      }

      setUser(userData)
      await fetchStats()
    } catch (error) {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }, [supabase.auth, supabase.from, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories()
      fetchProducts()
    }
    else if (activeTab === "products") fetchProducts()
  }, [activeTab])

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await response.json()
      setUploading(false)
      if (data.secure_url) {
        toast.success("Upload successful!")
        return data.secure_url
      } else {
        toast.error("Upload failed")
        return null
      }
    } catch (error) {
      setUploading(false)
      toast.error("Upload failed")
      return null
    }
  }

  const uploadMultipleFiles = async (files: FileList) => {
    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await response.json()
        return data.secure_url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const successfulUploads = uploadedUrls.filter(url => url != null)

      if (successfulUploads.length > 0) {
        toast.success(`${successfulUploads.length} image(s) uploaded successfully!`)
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, ...successfulUploads]
        }))
      } else {
        toast.error("Upload failed")
      }
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    toast.success("Image removed")
  }

  const saveCategory = async () => {
    if (!categoryForm.name) { toast.error("Category name required"); return }
    try {
      if (editingItem) {
        const { error } = await supabase.from("categories").update(categoryForm).eq("id", editingItem.id)
        if (error) throw error
        toast.success("Category updated")
      } else {
        const { error } = await supabase.from("categories").insert(categoryForm)
        if (error) throw error
        toast.success("Category created")
      }
      setShowCategoryModal(false)
      setCategoryForm({ name: "", image_url: "" })
      setEditingItem(null)
      fetchCategories()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) toast.error(error.message)
    else { toast.success("Category deleted"); fetchCategories() }
  }

  const saveProduct = async () => {
    if (!productForm.title || !productForm.price) { toast.error("Fill required fields"); return }
    try {
      const tags = productForm.tags ? productForm.tags.split(",").map(t => t.trim()) : []
      const productData = {
        title: productForm.title,
        description_en: productForm.description_en,
        description_ar: productForm.description_ar,
        price: parseFloat(productForm.price.toString()),
        stock: parseInt(productForm.stock.toString()),
        category_id: productForm.category_id || null,
        image_url: productForm.images.length > 0 ? productForm.images[0] : (productForm.image_url || null),
        images: productForm.images,
        tags,
        specs: productForm.specs || null,
        features: productForm.features || null,
        properties: productForm.properties || null,
        colors: productForm.colors,
        wood_types: productForm.wood_types
      }

      if (editingItem) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingItem.id)
        if (error) throw error
        toast.success("Product updated")
      } else {
        const { error } = await supabase.from("products").insert(productData)
        if (error) throw error
        toast.success("Product created")
      }
      setShowProductModal(false)
      setProductForm({ title: "", description_en: "", description_ar: "", price: 0, stock: 0, category_id: "", image_url: "", images: [], tags: "", specs: "", features: "", properties: "", colors: [], wood_types: [] })
      setEditingItem(null)
      fetchProducts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) toast.error(error.message)
    else { toast.success("Product deleted"); fetchProducts() }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="relative">
          <div className="w-16 h-16 border-4 rounded-full" style={{ borderColor: "#E0E7FF", borderTopColor: "#3B82F6", animation: "spin 1s linear infinite" }}></div>
          <div className="absolute inset-0 w-16 h-16 border-4 rounded-full" style={{ borderColor: "transparent", borderBottomColor: "#60A5FA", animation: "spin 1.5s linear infinite reverse", opacity: 0.5 }}></div>
        </div>
        <p className="text-sm font-semibold animate-pulse" style={{ color: "#64748B" }}>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9FAFB" }}>
      <AdminHeader
        title="Admin Dashboard"
        userName={user?.name}
        userEmail={user?.email}
        onSignOut={async () => {
          await supabase.auth.signOut()
          window.location.href = "/admin/login"
        }}
      />

      <div className="bg-white border-b" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)" }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { id: "categories", label: "Categories", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
              { id: "products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
              { id: "security", label: "Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2 px-5 py-3.5 font-semibold text-sm transition-all rounded-t-xl"
                style={{
                  color: activeTab === tab.id ? "#2563EB" : "#64748B",
                  backgroundColor: activeTab === tab.id ? "#EFF6FF" : "transparent",
                  borderBottom: activeTab === tab.id ? "3px solid #2563EB" : "3px solid transparent"
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = "#F8FAFC"
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatsCard label="Total Products" value={stats.totalProducts} color="#3B82F6" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              <StatsCard label="Total Orders" value={stats.totalOrders} color="#10B981" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              <StatsCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="#16A34A" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#0F172A" }}>Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: "Manage Categories", desc: "Organize products", tab: "categories", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", color: "#8B5CF6" },
                { label: "Manage Products", desc: "Add/edit products", tab: "products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "#10B981" },
                { label: "Security Settings", desc: "Manage 2FA & security", tab: "security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", color: "#F59E0B" }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(action.tab as any)}
                  className="p-6 bg-white border-2 rounded-2xl text-left transition-all group"
                  style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)"
                    e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
                    e.currentTarget.style.borderColor = action.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
                    e.currentTarget.style.borderColor = "#E5E7EB"
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl transition-all" style={{ backgroundColor: "#F8FAFC", border: "2px solid #E5E7EB" }}>
                      <svg className="w-6 h-6 transition-all" style={{ color: action.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 transition-all group-hover:translate-x-1" style={{ color: "#CBD5E1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-base mb-1.5" style={{ color: "#0F172A" }}>{action.label}</h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>{action.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === "categories" && (
          <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>Category Management</h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>Organize your products into categories</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setCategoryForm({ name: "", image_url: "" }); setShowCategoryModal(true) }}
                className="px-5 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
                style={{ backgroundColor: "#8B5CF6" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7C3AED"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B5CF6"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </button>
            </div>
            <CategoryList
              categories={categories}
              products={products}
              onEditCategory={(c) => { setEditingItem(c); setCategoryForm({ name: c.name, image_url: (c as any).image_url || "" }); setShowCategoryModal(true) }}
              onDeleteCategory={deleteCategory}
              onAddProduct={(categoryId) => {
                setEditingItem(null)
                setProductForm({ title: "", description_en: "", description_ar: "", price: 0, stock: 0, category_id: categoryId, image_url: "", images: [], tags: "", specs: "", features: "", properties: "", colors: [], wood_types: [] })
                setShowProductModal(true)
              }}
              onEditProduct={(p) => {
                setEditingItem(p);
                setProductForm({
                  title: p.title,
                  description_en: p.description_en || "",
                  description_ar: p.description_ar || "",
                  price: p.price,
                  stock: p.stock,
                  category_id: p.category_id || "",
                  image_url: p.image_url || "",
                  images: p.images || [],
                  tags: p.tags?.join(", ") || "",
                  specs: p.specs || "",
                  features: p.features || "",
                  properties: p.properties || "",
                  colors: p.colors || [],
                  wood_types: p.wood_types || []
                });
                setShowProductModal(true)
              }}
              onDeleteProduct={deleteProduct}
            />
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>Product Management</h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>Add and manage your product inventory</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setProductForm({ title: "", description_en: "", description_ar: "", price: 0, stock: 0, category_id: "", image_url: "", images: [], tags: "", specs: "", features: "", properties: "", colors: [], wood_types: [] }); setShowProductModal(true) }}
                className="px-5 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
                style={{ backgroundColor: "#10B981" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#10B981"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>
            <ProductList
              products={products}
              categories={categories}
              onEdit={(p) => {
                setEditingItem(p);
                setProductForm({
                  title: p.title,
                  description_en: p.description_en || "",
                  description_ar: p.description_ar || "",
                  price: p.price,
                  stock: p.stock,
                  category_id: p.category_id || "",
                  image_url: p.image_url || "",
                  images: p.images || [],
                  tags: p.tags?.join(", ") || "",
                  specs: p.specs || "",
                  features: p.features || "",
                  properties: p.properties || "",
                  colors: p.colors || [],
                  wood_types: p.wood_types || []
                });
                setShowProductModal(true)
              }}
              onDelete={deleteProduct}
            />
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>Security Settings</h2>
              <p className="text-sm mt-1" style={{ color: "#64748B" }}>Manage authentication and account security</p>
            </div>
            <TwoFactorManagement />
          </div>
        )}
      </main>

      {/* CATEGORY MODAL */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title={editingItem ? "Edit Category" : "Add Category"} size="sm">
        <CategoryForm
          name={categoryForm.name}
          imageUrl={categoryForm.image_url}
          uploading={uploading}
          onChange={(field, value) => setCategoryForm({ ...categoryForm, [field]: value })}
          onFileUpload={async (file) => {
            const url = await uploadFile(file)
            if (url) setCategoryForm({ ...categoryForm, image_url: url })
          }}
          onSubmit={saveCategory}
          onCancel={() => setShowCategoryModal(false)}
        />
      </Modal>

      {/* PRODUCT MODAL */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={editingItem ? "Edit Product" : "Add Product"} size="xl">
        <ProductForm
          form={productForm}
          categories={categories}
          uploading={uploading}
          onChange={(field, value) => setProductForm({ ...productForm, [field]: value })}
          onFileUpload={async (file) => {
            const url = await uploadFile(file)
            if (url) setProductForm({ ...productForm, image_url: url })
          }}
          onMultipleFileUpload={uploadMultipleFiles}
          onRemoveImage={removeImage}
          onSubmit={saveProduct}
          onCancel={() => setShowProductModal(false)}
        />
      </Modal>
    </div>
  )
}
