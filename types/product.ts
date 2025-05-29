export interface Product {
  id: string
  name: string
  description: string
  model: string
  category: string
  image: string
  badge?: string
  rating: number
  reviews: number
  features: string[]
  applications: string[]
  specifications:string[]
  createdAt: string
}

export interface Category {
  id: string
  name: string
  count: number
}
