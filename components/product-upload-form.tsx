"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Upload, X, Plus, Edit, Trash2, Eye, Search } from "lucide-react"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "../firebase"
import Image from "next/image"

const categories = [
  { id: "windows", name: "Aluminium Windows" },
  { id: "doors", name: "Doors & Frames" },
  { id: "railings", name: "Railings & Balustrades" },
  { id: "curtain-walls", name: "Curtain Walls" },
  { id: "roofing", name: "Roofing Systems" },
  { id: "partitions", name: "Partitions & Facades" },
  { id: "accessories", name: "Accessories & Hardware" },
  { id: "custom", name: "Custom Solutions" },
  { id: "other", name: "Other" },
  { id: "handles", name: "Handles & Locks" },
  { id: "glass", name: "Glass & Glazing" },
]

interface Product {
  id?: string
  name: string
  category: string
  model: string
  rating: number
  reviews: number
  badge: string
  description: string
  specifications: Record<string, string>
  features: string[]
  applications: string[]
  image?: string
  createdAt?: any
  updatedAt?: any
}

const initialForm: Product = {
  name: "",
  category: "",
  model: "",
  rating: 4.5,
  reviews: 0,
  badge: "",
  description: "",
  specifications: {},
  features: [],
  applications: [],
}

export function ProductUploadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [form, setForm] = useState<Product>(initialForm)
  const [newSpec, setNewSpec] = useState({ key: "", value: "" })
  const [newFeature, setNewFeature] = useState("")
  const [newApplication, setNewApplication] = useState("")

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]
      setProducts(productsData)
    } catch (err: any) {
      setError("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) throw new Error("No image selected")

    const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`)
    const snapshot = await uploadBytes(imageRef, imageFile)
    return await getDownloadURL(snapshot.ref)
  }

  const addSpecification = () => {
    if (newSpec.key && newSpec.value) {
      setForm((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpec.key]: newSpec.value,
        },
      }))
      setNewSpec({ key: "", value: "" })
    }
  }

  const removeSpecification = (key: string) => {
    setForm((prev) => {
      const newSpecs = { ...prev.specifications }
      delete newSpecs[key]
      return { ...prev, specifications: newSpecs }
    })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const addApplication = () => {
    if (newApplication.trim()) {
      setForm((prev) => ({
        ...prev,
        applications: [...prev.applications, newApplication.trim()],
      }))
      setNewApplication("")
    }
  }

  const removeApplication = (index: number) => {
    setForm((prev) => ({
      ...prev,
      applications: prev.applications.filter((_, i) => i !== index),
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setImageFile(null)
    setImagePreview("")
    setNewSpec({ key: "", value: "" })
    setNewFeature("")
    setNewApplication("")
  }

  // CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const imageUrl = await uploadImage()

      const productData = {
        ...form,
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "products"), productData)
      setSuccess("Product created successfully!")
      resetForm()
      fetchProducts()
    } catch (err: any) {
      setError(err.message || "Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  // UPDATE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct?.id) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let imageUrl = editingProduct.image

      if (imageFile) {
        imageUrl = await uploadImage()
        // Delete old image if it exists
        if (editingProduct.image) {
          try {
            const oldImageRef = ref(storage, editingProduct.image)
            await deleteObject(oldImageRef)
          } catch (err) {
            console.log("Old image not found or already deleted")
          }
        }
      }

      const productData = {
        ...form,
        image: imageUrl,
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "products", editingProduct.id), productData)
      setSuccess("Product updated successfully!")
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (err: any) {
      setError(err.message || "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  // DELETE
  const handleDelete = async (product: Product) => {
    if (!product.id || !confirm("Are you sure you want to delete this product?")) return

    setLoading(true)
    setError("")

    try {
      // Delete image from storage
      if (product.image) {
        try {
          const imageRef = ref(storage, product.image)
          await deleteObject(imageRef)
        } catch (err) {
          console.log("Image not found or already deleted")
        }
      }

      // Delete document from Firestore
      await deleteDoc(doc(db, "products", product.id))
      setSuccess("Product deleted successfully!")
      fetchProducts()
    } catch (err: any) {
      setError(err.message || "Failed to delete product")
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setForm(product)
    setImagePreview(product.image || "")
    setIsEditDialogOpen(true)
  }

  const startView = (product: Product) => {
    setViewingProduct(product)
    setIsViewDialogOpen(true)
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || categoryId
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Product List</TabsTrigger>
          <TabsTrigger value="create">Add New Product</TabsTrigger>
        </TabsList>

        {/* Product List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>View, edit, and delete your products</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        {product.badge && <Badge className="absolute top-2 left-2">{product.badge}</Badge>}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getCategoryName(product.category)} • {product.model}
                        </p>
                        <p className="text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startView(product)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">No products found matching your criteria.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Product Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>
                Upload a new product to the catalogue with all specifications and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Premium Sliding Window"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={form.model}
                      onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                      placeholder="PSW-2024"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => setForm((prev) => ({ ...prev, rating: Number.parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviews">Reviews Count</Label>
                    <Input
                      id="reviews"
                      type="number"
                      min="0"
                      value={form.reviews}
                      onChange={(e) => setForm((prev) => ({ ...prev, reviews: Number.parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="badge">Badge (Optional)</Label>
                  <Input
                    id="badge"
                    value={form.badge}
                    onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="Best Seller, Premium, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed product description..."
                    rows={4}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="flex items-center gap-4">
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} required />
                    {imagePreview && (
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                        width={80}
                        height={80}
                      />
                    )}
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <Label>Technical Specifications</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Specification name"
                      value={newSpec.key}
                      onChange={(e) => setNewSpec((prev) => ({ ...prev, key: e.target.value }))}
                    />
                    <Input
                      placeholder="Specification value"
                      value={newSpec.value}
                      onChange={(e) => setNewSpec((prev) => ({ ...prev, value: e.target.value }))}
                    />
                    <Button type="button" onClick={addSpecification}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Spec
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(form.specifications).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-sm">
                        {key}: {value}
                        <button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <Label>Key Features</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Applications */}
                <div className="space-y-4">
                  <Label>Applications</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an application"
                      value={newApplication}
                      onChange={(e) => setNewApplication(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addApplication())}
                    />
                    <Button type="button" onClick={addApplication}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.applications.map((app, index) => (
                      <Badge key={index} variant="secondary">
                        {app}
                        <button
                          type="button"
                          onClick={() => removeApplication(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Product
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information and details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Same form fields as create, but for editing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  value={form.model}
                  onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rating">Rating</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => setForm((prev) => ({ ...prev, rating: Number.parseFloat(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reviews">Reviews Count</Label>
                <Input
                  id="edit-reviews"
                  type="number"
                  min="0"
                  value={form.reviews}
                  onChange={(e) => setForm((prev) => ({ ...prev, reviews: Number.parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-badge">Badge (Optional)</Label>
              <Input
                id="edit-badge"
                value={form.badge}
                onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">Product Image (Optional - leave empty to keep current)</Label>
              <div className="flex items-center gap-4">
                <Input id="edit-image" type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                    width={80}
                    height={80}
                  />
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Product
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingProduct?.name}</DialogTitle>
            <DialogDescription>Product Details</DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-6">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={viewingProduct.image || "/placeholder.svg"}
                  alt={viewingProduct.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <p>{getCategoryName(viewingProduct.category)}</p>
                </div>
                <div>
                  <Label>Model</Label>
                  <p>{viewingProduct.model}</p>
                </div>
                <div>
                  <Label>Rating</Label>
                  <p>
                    {viewingProduct.rating}/5 ({viewingProduct.reviews} reviews)
                  </p>
                </div>
                {viewingProduct.badge && (
                  <div>
                    <Label>Badge</Label>
                    <Badge>{viewingProduct.badge}</Badge>
                  </div>
                )}
              </div>

              <div>
                <Label>Description</Label>
                <p className="mt-1">{viewingProduct.description}</p>
              </div>

              {Object.keys(viewingProduct.specifications).length > 0 && (
                <div>
                  <Label>Specifications</Label>
                  <div className="mt-2 space-y-1">
                    {Object.entries(viewingProduct.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingProduct.features.length > 0 && (
                <div>
                  <Label>Features</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewingProduct.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewingProduct.applications.length > 0 && (
                <div>
                  <Label>Applications</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewingProduct.applications.map((app, index) => (
                      <Badge key={index} variant="secondary">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success/Error Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
