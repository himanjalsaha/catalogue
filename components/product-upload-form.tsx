"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X, Plus } from "lucide-react"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../firebase"
import Image from "next/image"

const categories = [
  { id: "windows", name: "Aluminium Windows" },
  { id: "doors", name: "Doors & Frames" },
  { id: "railings", name: "Railings & Balustrades" },
  { id: "curtain-walls", name: "Curtain Walls" },
  { id: "roofing", name: "Roofing Systems" },
]

interface ProductForm {
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
}

export function ProductUploadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [form, setForm] = useState<ProductForm>({
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
  })

  const [newSpec, setNewSpec] = useState({ key: "", value: "" })
  const [newFeature, setNewFeature] = useState("")
  const [newApplication, setNewApplication] = useState("")

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

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) throw new Error("No image selected")

    const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`)
    const snapshot = await uploadBytes(imageRef, imageFile)
    return await getDownloadURL(snapshot.ref)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Upload image first
      const imageUrl = await uploadImage()

      // Create product document
      const productData = {
        ...form,
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "products"), productData)

      setSuccess(true)
      // Reset form
      setForm({
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
      })
      setImageFile(null)
      setImagePreview("")
    } catch (err: any) {
      setError(err.message || "Failed to upload product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Upload a new product to the catalogue with all specifications and details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Product uploaded successfully!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Upload className="mr-2 h-4 w-4" />
            Upload Product
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
