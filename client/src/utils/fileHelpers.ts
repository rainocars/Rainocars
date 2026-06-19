/**
 * Converts a Base64 Data URI to a Blob Object URL to bypass browser security restrictions.
 */
export const base64ToBlobUrl = (base64Data: string): string => {
  try {
    if (!base64Data || !base64Data.startsWith('data:')) {
      return base64Data; // Return as is if already a normal URL or empty
    }
    const arr = base64Data.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Failed to convert base64 to blob:', err);
    return base64Data;
  }
};

/**
 * Triggers a browser download dialog for a Base64 data attachment.
 */
export const downloadBase64File = (base64Data: string, fileName: string) => {
  try {
    const url = base64ToBlobUrl(base64Data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (url.startsWith('blob:')) {
      // Allow download to start before revoking URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  } catch (err) {
    console.error('Failed to download file:', err);
  }
};
