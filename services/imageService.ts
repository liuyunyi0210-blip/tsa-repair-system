
/**
 * 圖片處理服務 - 提供壓縮、轉換等功能，優化儲存空間
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

export const compressImage = (file: File | Blob, options: CompressionOptions = {}): Promise<string> => {
    const {
        maxWidth = 800,
        maxHeight = 800,
        quality = 0.6
    } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 計算缩放比例
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // 轉換為 JPEG 以獲得更好的壓縮率
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * 計算 Base64 字串的約略大小 (Bytes)
 */
export const getBase64Size = (base64String: string): number => {
    const padding = (base64String.match(/=/g) || []).length;
    return (base64String.length * 0.75) - padding;
};

/**
 * 檢查整個資料物件是否接近 Gist 限制 (1MB)
 */
export const checkGistQuota = (data: any): { totalSize: number; isNearLimit: boolean } => {
    const jsonString = JSON.stringify(data);
    const size = jsonString.length; // 概算
    return {
        totalSize: size,
        isNearLimit: size > 900 * 1024 // 900KB
    };
};
