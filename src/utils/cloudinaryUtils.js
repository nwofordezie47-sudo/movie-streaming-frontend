/**
 * Transforms a Cloudinary video URL to ensure H.264 transcoding and auto-quality.
 * This fixes playback issues for codecs like H.265/HEVC (e.g., in MKV files) 
 * by forcing MP4 delivery with a compatible codec.
 * 
 * @param {string} url - The original Cloudinary video URL
 * @returns {string} - The transformed URL or the original if not a Cloudinary URL
 */
export const getTransformedVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return url;

    // Only process Cloudinary URLs
    if (!url.includes('res.cloudinary.com')) return url;

    // Don't double-transform if it's already transcoded or has transformations
    if (url.includes('vc_h264') || url.includes('/q_auto')) return url;

    // Ensure we are dealing with a video upload
    if (!url.includes('/video/upload/')) return url;

    const transformation = 'q_auto,vc_h264';
    
    // Replace the extension with .mp4 and insert transformation after /upload/
    // Example: .../video/upload/v123/folder/video.mkv -> .../video/upload/q_auto,vc_h264/v123/folder/video.mp4
    
    let transformedUrl = url.replace(/\/video\/upload\//, `/video/upload/${transformation}/`);
    
    // Replace original extension with .mp4
    // We target the extension at the end of the URL before any query params
    const urlParts = transformedUrl.split('?');
    const baseUrl = urlParts[0];
    const queryParams = urlParts[1] ? `?${urlParts[1]}` : '';
    
    const lastDotIndex = baseUrl.lastIndexOf('.');
    if (lastDotIndex > baseUrl.lastIndexOf('/')) {
        transformedUrl = baseUrl.substring(0, lastDotIndex) + '.mp4' + queryParams;
    }

    return transformedUrl;
};
