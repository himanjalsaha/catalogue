"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, Download, Mail, Phone } from "lucide-react"
import Image from "next/image"
import { Product } from "@/types/product"

interface ProductDetailDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl pr-8">{product.name}</DialogTitle>
          <DialogDescription>Model: {product.model}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Product Image */}
            <div className="space-y-4 order-1 lg:order-1">
              <div className="relative">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={400}
                  className="w-full h-full sm:h-full object-cover rounded-lg"
                />
                {product.badge && (
                  <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">{product.badge}</Badge>
                )}
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-gray-500">({product.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6 order-2 lg:order-2">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-600 text-sm sm:text-base">{product.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Applications</h3>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((app, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Action Buttons - Mobile First */}
              <div className="space-y-3 lg:hidden">
                <Button className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Request Quote
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Expert
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Brochure
                  </Button>
                </div>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden lg:block space-y-3">
                <div className="grid grid-cols-1 gap-3 w-full"> 
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Request Quote
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Expert
                  </Button>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Brochure
                </Button>
              </div>
            </div>
          </div>

          {/* Technical Specifications - Full Width */}
          <div className="px-6 pb-6">
            <Separator className="mb-6" />
            <div>
              <h3 className="font-semibold text-lg mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-start bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="font-medium text-sm text-gray-700 mb-1 sm:mb-0 sm:w-1/2">{key}:</span>
                    <span className="text-sm text-gray-600 sm:w-1/2 sm:text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
