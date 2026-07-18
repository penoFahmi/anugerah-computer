export interface LandingProduct {
    id: number;
    name: string;
    specs: string;
    price: string;
    status: string;
}

export interface LandingProps {
    products?: LandingProduct[];
}
