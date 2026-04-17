import fs from 'fs';
import path from 'path';

export function getBackgroundImages() {
    const directoryPath = path.join(process.cwd(), 'public/backgrounds');
  
    try {
        const files = fs.readdirSync(directoryPath);
    
        // Filter for image files only and return the public paths
        return files
            .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
            .map(file => `/backgrounds/${file}`);
    } catch (error) {
        console.error("Could not read backgrounds directory:", error);
        return [];
    }
}