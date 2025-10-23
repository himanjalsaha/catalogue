"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Star, Loader2, Share2, Heart, Mail, Phone, Download, MessageCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchProducts } from "../../../firebase"
import type { Product } from "../../../types/product"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>("")

  // Company contact details
  const phoneNumber = "+919954352673"
  const whatsappNumber = "919954352673" // Without + for WhatsApp URL

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Extract product ID from slug (last part after the last dash)
        const slug = params.slug as string
        const productId = slug.split('-').pop()
        
        if (!productId) {
          setError("Invalid product URL")
          return
        }

        const products = await fetchProducts()
        const foundProduct = products.find((p: Product) => p.id === productId)
        
        if (!foundProduct) {
          setError("Product not found")
          return
        }
        
        setProduct(foundProduct)
        setSelectedImage(foundProduct.image || "/placeholder.svg")
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setError("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      loadProduct()
    }
  }, [params.slug])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Product",
          text: product?.description || "Check out this product",
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleCallExpert = () => {
    window.location.href = `tel:${phoneNumber}`
  }

 const handleWhatsApp = () => {
    const productUrl = `https://catalogue-eta.vercel.app/product/${params.slug}`
    const message = encodeURIComponent(
      `Hi, I'm interested in this product: ${productUrl}. Could you please provide more information?`
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailQuote = () => {
    const subject = encodeURIComponent(`Quote Request for ${product?.name || 'Product'}`)
    const body = encodeURIComponent(
      `Hello,\n\nI would like to request a quote for the following product:\n\nProduct: ${product?.name || 'N/A'}\nModel: ${product?.model || 'N/A'}\nCategory: ${product?.category || 'N/A'}\n\nPlease provide pricing and availability information.\n\nThank you!`
    )
    window.location.href = `mailto:info@glamouraluminium.com?subject=${subject}&body=${body}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Product</h3>
              <p className="text-gray-600">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertDescription>{error || "Product not found"}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Catalogue
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">GA</span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Glamour Aluminium</h1>
                  <p className="text-xs md:text-sm text-gray-600">Premium Hardware Solutions</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Share</span>
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-blue-600">
            Home
          </button>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50">
              <Image
                src={selectedImage}
                alt={product.name || "Product"}
                fill
                className="object-cover"
                priority
              />
              {product.badge && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 capitalize">
                  {product.badge}
                </Badge>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.name || "Untitled Product"}
              </h1>
              <p className="text-lg text-gray-600 mb-4">Model: {product.model || "N/A"}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`w-5 h-5 ${
                          star <= (product.rating || 0) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium ml-2">{product.rating || 0}</span>
                </div>
                <span className="text-gray-500">({product.reviews || 0} reviews)</span>
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available"}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Applications */}
            {product.applications && product.applications.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3">Applications</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map((app: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <Button size="lg" className="w-full" onClick={handleEmailQuote}>
                <Mail className="w-4 h-4 mr-2" />
                Request Quote
              </Button> */}
              <Button size="lg" className="w-full" onClick={handleCallExpert}>
                <Phone className="w-4 h-4 mr-2" />
                Call Expert
              </Button>
               <Button variant="outline" size="lg" onClick={handleWhatsApp} className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Support
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             
              {/* <Button variant="outline" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download Brochure
              </Button> */}
            </div>
          </div>
        </div>

        {/* Technical Specifications - Full Width */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="font-medium text-gray-700 mb-1 sm:mb-0">{key}:</span>
                    <span className="text-gray-600">{value as string}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
                <li>Phone: +91 99543 52673</li>
                <li>Email: info@glamouraluminium.com</li>
                <li>Address: Goalpara 2 no. colony Assam 783101</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Glamour Aluminium. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}