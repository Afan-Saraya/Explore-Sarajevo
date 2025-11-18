/**
 * Upload a file to the server and get back the URL
 * @param file - The file to upload
 * @returns The uploaded file URL
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
  
  const result = await response.json();
  return result.url;
}

/**
 * Upload multiple files to the server and get back an array of URLs
 * @param files - Array of files to upload
 * @returns Array of uploaded file URLs
 */
export async function uploadFiles(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file));
  return Promise.all(uploadPromises);
}
