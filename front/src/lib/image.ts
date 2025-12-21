import { toPng } from "html-to-image";

/**
 * Captures a snapshot of the given HTMLElement and triggers a download of the image.
 *
 * @param element - The DOM element to capture.
 * @param fileName - The name of the file to save (without extension).
 */
export const downloadElementAsImage = async (
  element: HTMLElement,
  fileName: string,
  backgroundColor: string = "transparent",
): Promise<void> => {
  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      backgroundColor,
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to capture image:", error);
    throw error;
  }
};
