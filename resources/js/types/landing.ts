export interface LandingProduct {
    id: number;
    name: string;
    specs: string;
    price: string;
    status: string;
    image: string | null;
}

export interface LandingProps {
    products?: LandingProduct[];
    store?: any;
}
