import ReactNativeBlobUtil from 'react-native-blob-util';
import { getSecureItem, setSecureItem } from '../utils/secureStorage';

const CACHE_DIR = ReactNativeBlobUtil.fs.dirs.DocumentDir + '/print_cache';
const FILE_MAP_KEY = 'jusprint_file_cache_map';

interface CacheEntry {
    localPath: string;
    originalName: string;
    size: number;
    mimeType: string;
    addedAt: number;
}

/**
 * Cache Service to handle local persistence of physical files and data
 */
export const cacheService = {
    /**
     * Ensures the cache directory exists
     */
    init: async () => {
        const exists = await ReactNativeBlobUtil.fs.isDir(CACHE_DIR);
        if (!exists) {
            await ReactNativeBlobUtil.fs.mkdir(CACHE_DIR);
        }
    },

    /**
     * Saves a file to the local app cache if it doesn't already exist.
     * Uses fileName + size as a simple deduplication key.
     */
    cacheFile: async (uri: string, name: string, type: string): Promise<string> => {
        try {
            await cacheService.init();

            // Get file info for deduplication
            const stat = await ReactNativeBlobUtil.fs.stat(uri.replace('file://', ''));
            const size = stat.size;
            const fileKey = `${name}_${size}`;

            // Check if already cached
            const mapStr = await getSecureItem(FILE_MAP_KEY);
            const fileMap: Record<string, CacheEntry> = mapStr ? JSON.parse(mapStr) : {};

            if (fileMap[fileKey]) {
                const cachedPath = fileMap[fileKey].localPath;
                const fileExists = await ReactNativeBlobUtil.fs.exists(cachedPath);
                if (fileExists) {
                    console.log(`[CACHE] File already exists: ${name}`);
                    return cachedPath;
                }
            }

            // Copy to local cache
            const extension = name.split('.').pop() || 'pdf';
            const localFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
            const localPath = `${CACHE_DIR}/${localFileName}`;

            // Use cp to duplicate the file locally
            await ReactNativeBlobUtil.fs.cp(uri.replace('file://', ''), localPath);

            // Update map
            fileMap[fileKey] = {
                localPath,
                originalName: name,
                size,
                mimeType: type,
                addedAt: Date.now()
            };

            await setSecureItem(FILE_MAP_KEY, JSON.stringify(fileMap));
            console.log(`[CACHE] Successfully cached: ${name} -> ${localPath}`);

            return localPath;
        } catch (error) {
            console.error('[CACHE] Error caching file:', error);
            return uri; // Return original URI as fallback
        }
    },

    /**
     * Gets all cached file entries
     */
    getCachedFiles: async (): Promise<CacheEntry[]> => {
        const mapStr = await getSecureItem(FILE_MAP_KEY);
        if (!mapStr) return [];
        const fileMap: Record<string, CacheEntry> = JSON.parse(mapStr);
        return Object.values(fileMap).sort((a, b) => b.addedAt - a.addedAt);
    }
};
