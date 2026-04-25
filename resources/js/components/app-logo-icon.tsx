import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            {...props} 
            src="/apple-touch-icon.png" 
            alt="Anugerah Computer Logo"
            className="h-9 w-auto"
        />
    );
}
