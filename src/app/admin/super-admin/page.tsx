"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import Modal from "@/components/Admin/Modal"
import ProductList from "@/components/Admin/ProductList"
import CategoryList from "@/components/Admin/CategoryList"
import StatsCard from "@/components/Admin/StatsCard"
import UserList from "@/components/Admin/UserList"
import AdminHeader from "@/components/Admin/AdminHeader"
import UserForm from "@/components/Admin/UserForm"
import CategoryForm from "@/components/Admin/CategoryForm"
import ProductForm from "@/components/Admin/ProductForm"
import TwoFactorManagement from "@/components/Admin/TwoFactorManagement"
import ReviewManagement from "@/components/Admin/ReviewManagement"
import BannerForm from "@/components/Admin/BannerForm"
import BannerList from "@/components/Admin/BannerList"
import SpecialOfferForm from "@/components/Admin/SpecialOfferForm"
import SpecialOfferList from "@/components/Admin/SpecialOfferList"
import OrderManagement from "@/components/Admin/OrderManagement"

interface User {
  id: string
  name: string
  email: string
  role: string
  account_status: string
  phone?: string
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

interface PromoBanner {
  id: string
  title: string
  subtitle?: string
  description?: string
  discount_text?: string
  button_text?: string
  button_url?: string
  image_url?: string
  countdown_end?: string
  is_active: boolean
  display_order: number
}

interface SpecialOffer {
  id: string
  title: string
  description?: string
  discount_percentage?: number
  original_price?: number
  discounted_price?: number
  image_url?: string
  product_ids?: string[]
  category_ids?: string[]
  start_date?: string
  end_date?: string
  is_active: boolean
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "categories" | "products" | "orders" | "reviews" | "banners" | "special-offers" | "security">("dashboard")

  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 })
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])

  const [showUserModal, setShowUserModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showSpecialOfferModal, setShowSpecialOfferModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "customer", phone: "" })
  const [categoryForm, setCategoryForm] = useState({ name: "", image_url: "" })
  const [productForm, setProductForm] = useState({
    title: "", description_en: "", description_ar: "", price: 0, stock: 0,
    category_id: "", image_url: "", images: [] as string[], tags: "",
    specs: "", features: "", properties: "",
    colors: [] as string[], wood_types: [] as string[]
  })
  const [bannerForm, setBannerForm] = useState({
    title: "", subtitle: "", description: "", discount_text: "",
    button_text: "Buy Now", button_url: "", image_url: "", countdown_end: ""
  })
  const [specialOfferForm, setSpecialOfferForm] = useState({
    title: "", description: "", discount_percentage: 0, original_price: 0,
    discounted_price: 0, image_url: "", product_ids: [] as string[],
    category_ids: [] as string[], start_date: "", end_date: ""
  })
  const [uploading, setUploading] = useState(false)

  const fetchStats = async () => {
    const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })
    const { data: ordersData, count: ordersCount } = await supabase.from("orders").select("total_amount", { count: "exact" })
    const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })
    const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    setStats({ totalProducts: productsCount || 0, totalOrders: ordersCount || 0, totalUsers: usersCount || 0, totalRevenue })
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("in_date", { ascending: false })
    setUsers(data || [])
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name", { ascending: true })
    setCategories(data || [])
  }

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("in_date", { ascending: false })
    setProducts(data || [])
  }

  const fetchBanners = async () => {
    const { data } = await supabase.from("promo_banners").select("*").order("display_order", { ascending: true })
    setBanners(data || [])
  }

  const fetchSpecialOffers = async () => {
    const { data } = await supabase.from("special_offers").select("*").order("created_at", { ascending: false })
    setSpecialOffers(data || [])
  }

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push("/admin/login"); return }

      const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()
      if (!userData || userData.role !== "super_admin") {
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
    if (activeTab === "users") fetchUsers()
    else if (activeTab === "categories") {
      fetchCategories()
      fetchProducts()
    }
    else if (activeTab === "products") fetchProducts()
    else if (activeTab === "banners") fetchBanners()
    else if (activeTab === "special-offers") {
      fetchSpecialOffers()
      fetchProducts()
      fetchCategories()
    }
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

  const saveUser = async () => {
    if (!userForm.email || !userForm.name) { toast.error("Fill all required fields"); return }

    try {
      if (editingItem) {
        const { error } = await supabase.from("users").update({
          name: userForm.name, role: userForm.role, phone: userForm.phone
        }).eq("id", editingItem.id)
        if (error) throw error
        toast.success("User updated")
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userForm.email, password: userForm.password || "TempPassword123!"
        })
        if (authError) throw authError

        const { error } = await supabase.from("users").insert({
          id: authData.user?.id, name: userForm.name, email: userForm.email,
          role: userForm.role, phone: userForm.phone, account_status: "active"
        })
        if (error) throw error
        toast.success("User created")
      }

      setShowUserModal(false)
      setUserForm({ name: "", email: "", password: "", role: "customer", phone: "" })
      setEditingItem(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return
    const { error } = await supabase.from("users").delete().eq("id", id)
    if (error) toast.error(error.message)
    else { toast.success("User deleted"); fetchUsers() }
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

  const saveBanner = async () => {
    if (!bannerForm.title) { toast.error("Banner title required"); return }

    try {
      const bannerData = {
        title: bannerForm.title,
        subtitle: bannerForm.subtitle || null,
        description: bannerForm.description || null,
        discount_text: bannerForm.discount_text || null,
        button_text: bannerForm.button_text || "Buy Now",
        button_url: bannerForm.button_url || null,
        image_url: bannerForm.image_url || null,
        countdown_end: bannerForm.countdown_end ? new Date(bannerForm.countdown_end).toISOString() : null,
        is_active: editingItem ? editingItem.is_active : true,
        display_order: editingItem ? editingItem.display_order : 0
      }

      if (editingItem) {
        const { error } = await supabase.from("promo_banners").update(bannerData).eq("id", editingItem.id)
        if (error) throw error
        toast.success("Banner updated")
      } else {
        const { error } = await supabase.from("promo_banners").insert(bannerData)
        if (error) throw error
        toast.success("Banner created")
      }

      setShowBannerModal(false)
      setBannerForm({ title: "", subtitle: "", description: "", discount_text: "", button_text: "Buy Now", button_url: "", image_url: "", countdown_end: "" })
      setEditingItem(null)
      fetchBanners()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return
    const { error } = await supabase.from("promo_banners").delete().eq("id", id)
    if (error) toast.error(error.message)
    else { toast.success("Banner deleted"); fetchBanners() }
  }

  const toggleBannerActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("promo_banners").update({ is_active: !currentStatus }).eq("id", id)
    if (error) toast.error(error.message)
    else {
      toast.success(!currentStatus ? "Banner activated" : "Banner deactivated")
      fetchBanners()
    }
  }

  const saveSpecialOffer = async () => {
    if (!specialOfferForm.title) { toast.error("Special offer title required"); return }

    try {
      const offerData = {
        title: specialOfferForm.title,
        description: specialOfferForm.description || null,
        discount_percentage: specialOfferForm.discount_percentage || null,
        original_price: specialOfferForm.original_price || null,
        discounted_price: specialOfferForm.discounted_price || null,
        image_url: specialOfferForm.image_url || null,
        product_ids: specialOfferForm.product_ids,
        category_ids: specialOfferForm.category_ids,
        start_date: specialOfferForm.start_date ? new Date(specialOfferForm.start_date).toISOString() : null,
        end_date: specialOfferForm.end_date ? new Date(specialOfferForm.end_date).toISOString() : null,
        is_active: editingItem ? editingItem.is_active : true
      }

      if (editingItem) {
        const { error } = await supabase.from("special_offers").update(offerData).eq("id", editingItem.id)
        if (error) throw error
        toast.success("Special offer updated")
      } else {
        const { error } = await supabase.from("special_offers").insert(offerData)
        if (error) throw error
        toast.success("Special offer created")
      }

      setShowSpecialOfferModal(false)
      setSpecialOfferForm({ title: "", description: "", discount_percentage: 0, original_price: 0, discounted_price: 0, image_url: "", product_ids: [], category_ids: [], start_date: "", end_date: "" })
      setEditingItem(null)
      fetchSpecialOffers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteSpecialOffer = async (id: string) => {
    if (!confirm("Delete this special offer?")) return
    const { error } = await supabase.from("special_offers").delete().eq("id", id)
    if (error) toast.error(error.message)
    else { toast.success("Special offer deleted"); fetchSpecialOffers() }
  }

  const toggleSpecialOfferActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("special_offers").update({ is_active: !currentStatus }).eq("id", id)
    if (error) toast.error(error.message)
    else {
      toast.success(!currentStatus ? "Special offer activated" : "Special offer deactivated")
      fetchSpecialOffers()
    }
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
        title="Super Admin Dashboard"
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
              { id: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
              { id: "categories", label: "Categories", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
              { id: "products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
              { id: "orders", label: "Orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
              { id: "reviews", label: "Reviews", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
              { id: "banners", label: "Promo Banners", icon: "M2 3h20M2 7h20M2 11h20M5 15h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" },
              { id: "special-offers", label: "Special Offers", icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatsCard label="Total Users" value={stats.totalUsers} color="#3B82F6" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              <StatsCard label="Total Products" value={stats.totalProducts} color="#60A5FA" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              <StatsCard label="Total Orders" value={stats.totalOrders} color="#10B981" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              <StatsCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="#16A34A" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#0F172A" }}>Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Manage Users", desc: "Add admins & users", tab: "users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "#3B82F6" },
                { label: "Manage Categories", desc: "Organize products", tab: "categories", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", color: "#8B5CF6" },
                { label: "Manage Products", desc: "Add/edit products", tab: "products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "#10B981" },
                { label: "Manage Reviews", desc: "Moderate customer reviews", tab: "reviews", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", color: "#F59E0B" },
                { label: "Security Settings", desc: "Manage 2FA & security", tab: "security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", color: "#EF4444" }
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

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>User Management</h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>Manage admin users and their permissions</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setUserForm({ name: "", email: "", password: "", role: "customer", phone: "" }); setShowUserModal(true) }}
                className="px-5 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
                style={{ backgroundColor: "#3B82F6" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </button>
            </div>
            <UserList
              users={users}
              onEdit={(u) => { setEditingItem(u); setUserForm({ name: u.name, email: u.email, password: "", role: u.role, phone: u.phone || "" }); setShowUserModal(true) }}
              onDelete={deleteUser}
              currentUserRole={user?.role}
            />
          </div>
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

        {activeTab === "orders" && (
          <OrderManagement />
        )}

        {activeTab === "reviews" && (
          <ReviewManagement />
        )}

        {activeTab === "banners" && (
          <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>Promotional Banners</h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>Create and manage homepage promotional banners with countdown timers</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setBannerForm({ title: "", subtitle: "", description: "", discount_text: "", button_text: "Buy Now", button_url: "", image_url: "", countdown_end: "" }); setShowBannerModal(true) }}
                className="px-5 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
                style={{ backgroundColor: "#3B82F6" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Banner
              </button>
            </div>
            <BannerList
              banners={banners}
              onEdit={(b: any) => {
                setEditingItem(b);
                setBannerForm({
                  title: b.title,
                  subtitle: b.subtitle || "",
                  description: b.description || "",
                  discount_text: b.discount_text || "",
                  button_text: b.button_text || "Buy Now",
                  button_url: b.button_url || "",
                  image_url: b.image_url || "",
                  countdown_end: b.countdown_end ? new Date(b.countdown_end).toISOString().slice(0, 16) : ""
                });
                setShowBannerModal(true)
              }}
              onDelete={deleteBanner}
              onToggleActive={toggleBannerActive}
            />
          </div>
        )}

        {activeTab === "special-offers" && (
          <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>Special Offers</h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>Create and manage special offers and discounts</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setSpecialOfferForm({ title: "", description: "", discount_percentage: 0, original_price: 0, discounted_price: 0, image_url: "", product_ids: [], category_ids: [], start_date: "", end_date: "" }); setShowSpecialOfferModal(true) }}
                className="px-5 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
                style={{ backgroundColor: "#F59E0B" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#D97706"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F59E0B"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Special Offer
              </button>
            </div>
            <SpecialOfferList
              specialOffers={specialOffers}
              products={products}
              categories={categories}
              onEdit={(o: any) => {
                setEditingItem(o);
                setSpecialOfferForm({
                  title: o.title,
                  description: o.description || "",
                  discount_percentage: o.discount_percentage || 0,
                  original_price: o.original_price || 0,
                  discounted_price: o.discounted_price || 0,
                  image_url: o.image_url || "",
                  product_ids: o.product_ids || [],
                  category_ids: o.category_ids || [],
                  start_date: o.start_date ? new Date(o.start_date).toISOString().slice(0, 16) : "",
                  end_date: o.end_date ? new Date(o.end_date).toISOString().slice(0, 16) : ""
                });
                setShowSpecialOfferModal(true)
              }}
              onDelete={deleteSpecialOffer}
              onToggleActive={toggleSpecialOfferActive}
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

      {/* USER MODAL */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editingItem ? "Edit User" : "Add User"}>
        <UserForm
          form={userForm}
          isEditing={!!editingItem}
          onChange={(field, value) => setUserForm({ ...userForm, [field]: value })}
          onSubmit={saveUser}
          onCancel={() => setShowUserModal(false)}
        />
      </Modal>

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

      {/* BANNER MODAL */}
      <Modal isOpen={showBannerModal} onClose={() => setShowBannerModal(false)} title={editingItem ? "Edit Banner" : "Add Banner"} size="lg">
        <BannerForm
          form={bannerForm}
          uploading={uploading}
          onChange={(field, value) => setBannerForm({ ...bannerForm, [field]: value })}
          onFileUpload={async (file) => {
            const url = await uploadFile(file)
            if (url) setBannerForm({ ...bannerForm, image_url: url })
          }}
          onSubmit={saveBanner}
          onCancel={() => setShowBannerModal(false)}
        />
      </Modal>

      {/* SPECIAL OFFER MODAL */}
      <Modal isOpen={showSpecialOfferModal} onClose={() => setShowSpecialOfferModal(false)} title={editingItem ? "Edit Special Offer" : "Add Special Offer"} size="lg">
        <SpecialOfferForm
          form={specialOfferForm}
          products={products}
          categories={categories}
          uploading={uploading}
          onChange={(field, value) => setSpecialOfferForm({ ...specialOfferForm, [field]: value })}
          onFileUpload={async (file) => {
            const url = await uploadFile(file)
            if (url) setSpecialOfferForm({ ...specialOfferForm, image_url: url })
          }}
          onSubmit={saveSpecialOffer}
          onCancel={() => setShowSpecialOfferModal(false)}
        />
      </Modal>
    </div>
  )
}
