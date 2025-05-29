"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Grid, List, Star, Eye, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProductDetailDialog } from "@/components/product-detail-dialog"
import { fetchProducts, getCategories } from "../firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product, Category } from "../types/product"

export default function CataloguePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("name")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Firebase state
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from Firebase on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedProducts = await fetchProducts()
        setProducts(fetchedProducts)

        // Generate categories from fetched products
        const generatedCategories = getCategories(fetchedProducts)
        setCategories(generatedCategories)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = products.filter((product: Product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case "name":
      default:
        return (a.name || "").localeCompare(b.name || "")
    }
  })

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">GA</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Glamour Aluminium</h1>
                    <p className="text-sm text-gray-600">Premium Hardware Solutions</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="outline">Contact Us</Button>
                {/* <Button>Get Quote</Button> */}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Products</h3>
              <p className="text-gray-600">Please wait while we fetch the latest products...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">GA</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Glamour Aluminium</h1>
                    <p className="text-sm text-gray-600">Premium Hardware Solutions</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="outline">Contact Us</Button>
                {/* <Button>Get Quote</Button> */}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">GA</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Glamour Aluminium</h1>
                  <p className="text-sm text-gray-600">Premium Hardware Solutions</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline">Contact Us</Button>
              {/* <Button>Get Quote</Button> */}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category: Category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                {/* Mobile Category Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="w-4 h-4 mr-2" />
                      Categories
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Categories</SheetTitle>
                      <SheetDescription>Filter products by category</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-2">
                      {categories.map((category: Category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{category.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {category.count}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {selectedCategory === "all"
                  ? "All Products"
                  : categories.find((c: Category) => c.id === selectedCategory)?.name}
                <span className="text-gray-500 ml-2">({sortedProducts.length} items)</span>
              </h2>
            </div>

            {/* Products Grid/List */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {sortedProducts.map((product: Product) => (
                <Card
                  key={product.id}
                  className={`group hover:shadow-lg transition-shadow ${
                    viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                  }`}
                >
                  <div className={viewMode === "list" ? "w-full sm:w-48 flex-shrink-0" : ""}>
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name || "Product"}
                          width={400}
                          height={300}
                          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                            viewMode === "list" ? "h-48 sm:h-full w-full sm:w-48" : "h-full w-full"
                          }`}
                        />
                        {product.badge && (
                          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-xs capitalize">
                            {product.badge}
                          </Badge>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <CardContent className="p-4 flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {product.name || "Untitled Product"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">Model: {product.model || "N/A"}</p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description || "No description available"}
                      </p>

                      <div className="space-y-3">
                        {product.features && product.features.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Key Features:</h4>
                            <div className="flex flex-wrap gap-1">
                              {product.features
                                .slice(0, viewMode === "list" ? 3 : 5)
                                .map((feature: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs capitalize">
                                    {feature}
                                  </Badge>
                                ))}
                              {product.features.length > (viewMode === "list" ? 3 : 5) && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.features.length - (viewMode === "list" ? 3 : 5)} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {product.applications && product.applications.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Applications:</h4>
                            <div className="flex flex-wrap gap-1">
                              {product.applications.slice(0, 3).map((app: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs capitalize">
                                  {app}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">{product.rating || 0}</span>
                          </div>
                          <span className="text-sm text-gray-500">({product.reviews || 0} reviews)</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button className="flex-1" onClick={() => setSelectedProduct(product)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" className="sm:w-auto">
                          Request Info
                        </Button>
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>

            {sortedProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Glamour Aluminium</h3>
              <p className="text-gray-400 text-sm">
                Premium quality aluminium hardware solutions for residential and commercial projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Windows & Doors</li>
                <li>Railings & Balustrades</li>
                <li>Curtain Walls</li>
                <li>Roofing Systems</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Custom Design</li>
                <li>Installation</li>
                <li>Maintenance</li>
                <li>Consultation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Phone: +91 96783 55177</li>
                <li>Email: info@glamouraluminium.com</li>
                <li>Address: 123 Industrial Ave</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Glamour Aluminium. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open: boolean) => !open && setSelectedProduct(null)}
      />
    </div>
  )
}
