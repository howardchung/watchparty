export interface ReportScreenshot { contentType: string; data: string }
export const screenshotLimit = 5 * 1024 * 1024;
export const screenshotTypes = ['image/png', 'image/jpeg', 'image/webp'];
export const screenshotBytes = (images: ReportScreenshot[]) => images.reduce((size, image) => size + image.data.length * 3 / 4 - (image.data.endsWith('==') ? 2 : image.data.endsWith('=') ? 1 : 0), 0);
export async function readScreenshots(files: File[], existing: ReportScreenshot[]): Promise<ReportScreenshot[]> {
  if (files.length + existing.length > 3 || files.reduce((size, file) => size + file.size, screenshotBytes(existing)) > screenshotLimit) throw new Error('Choose up to 3 screenshots, 5 MiB total.');
  if (files.some(file => !screenshotTypes.includes(file.type) || !file.size)) throw new Error('Choose a PNG, JPEG, or WebP image.');
  const images: ReportScreenshot[] = [];
  for (const file of files) {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('Couldn’t read the screenshot. Try selecting it again.'));
      reader.onabort = () => reject(new Error('Couldn’t read the screenshot. Try selecting it again.'));
      reader.readAsDataURL(file);
    });
    // Decode before accepting so unreadable files have a local recovery path.
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Choose a PNG, JPEG, or WebP image.'));
      image.src = `data:${file.type};base64,${data}`;
    });
    images.push({contentType: file.type, data});
  }
  return [...existing, ...images];
}
