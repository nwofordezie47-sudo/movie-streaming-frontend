/**
 * Transforms a video URL to ensure it uses the .mp4 extension.
 * Since all new uploads are transcoded to MP4 at upload-time,
 * this utility simply ensures the delivery extension is correct,
 * handling legacy .mkv URLs by replacing the extension.
 * 
 * @param {string} url - The original video URL
 * @returns {string} - The URL with .mp4 extension
 */
export const getTransformedVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return url;

    // Already MP4, return as-is
    if (url.toLowerCase().endsWith('.mp4')) return url;

    // Replace any extension with .mp4 for legacy URLs
    // We target the extension before any query params
    const [baseUrl, queryParams] = url.split('?');
    const transformedBaseUrl = baseUrl.replace(/\.[^.]+$/, '.mp4');
    
    return queryParams ? `${transformedBaseUrl}?${queryParams}` : transformedBaseUrl;
};
