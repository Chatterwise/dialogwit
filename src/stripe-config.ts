export interface Product {
  id: string
  priceId: string
  name: string
  description: string
  mode: 'payment' | 'subscription'
  price: number // in cents
}

export const products: Product[] = [
  {
    id: 'prod_SVwexdLkECUeHy',
    priceId: 'price_1RauldPTUKauYAQ6vsSK6qU6',
    name: 'Starter',
    description: 'Ideal for small businesses and personal projects.',
    mode: 'subscription',
    price: 1900 // $19.00
  },
  {
    id: 'prod_SVwfIxUk3kXDcU',
    priceId: 'price_1RaumJPTUKauYAQ6wMuBtA9g',
    name: 'Growth',
    description: 'Perfect for growing businesses with increased needs.',
    mode: 'subscription',
    price: 4900 // $49.00
  },
  {
    id: 'prod_SVwgGOmYhlE7vW',
    priceId: 'price_1RaunBPTUKauYAQ6Ig3ai8Ms',
    name: 'Business',
    description: 'Advanced features for established businesses.',
    mode: 'subscription',
    price: 9900 // $99.00
  }
]

export const getProductByPriceId = (priceId: string): Product | undefined => {
  return products.find(product => product.priceId === priceId)
}

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id)
}

export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)
}