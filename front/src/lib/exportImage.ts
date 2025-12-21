// Client-side helper to capture an element and trigger PNG download.
// Clones the element off-screen, inlines computed styles, then captures the clone.
export async function exportElementToPng(
  element: HTMLElement | null,
  filename = "capture.png",
): Promise<void> {
  if (!element) return Promise.reject(new Error("No element provided"));

  const cloneRoot = element.cloneNode(true) as HTMLElement;

  const copyComputedStyle = (source: Element, target: HTMLElement) => {
    try {
      const cs = window.getComputedStyle(source as Element);
      let cssText = "";
      for (let i = 0; i < cs.length; i++) {
        const prop = cs[i];
        cssText += `${prop}:${cs.getPropertyValue(prop)};`;
      }
      const prev = target.getAttribute("style") || "";
      target.setAttribute("style", prev + cssText);
    } catch {
      /* ignore */ 
    }
  };

  copyComputedStyle(element, cloneRoot);
  const origElems = element.querySelectorAll("*");
  const cloneElems = cloneRoot.querySelectorAll("*");
  for (let i = 0; i < origElems.length; i++) {
    const src = origElems[i] as Element;
    const dst = cloneElems[i] as HTMLElement | undefined;
    if (dst) copyComputedStyle(src, dst);
  }

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0px";
  wrapper.style.zIndex = "999999";
  wrapper.style.pointerEvents = "none";
  wrapper.style.visibility = "hidden";
  wrapper.appendChild(cloneRoot);

  const safeStyle = document.createElement("style");
  safeStyle.textContent = `
    .export-safe, .export-safe * { 
      color: #0f172a !important; 
      background: transparent !important; 
      background-color: transparent !important; 
      border-color: #0f172a !important; 
      box-shadow: none !important; 
      text-shadow: none !important; 
    }
    .export-safe img { background: transparent !important; }
  `;
  wrapper.appendChild(safeStyle);
  cloneRoot.classList.add("export-safe");

  document.body.appendChild(wrapper);

  try {
    try {
      const htmlToImage = await import("html-to-image");
      const toPng = htmlToImage.toPng as (node: HTMLElement, options?: any) => Promise<string>;
      const dataUrl = await toPng(cloneRoot, { cacheBust: true, quality: 0.98 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    } catch (e) {
      console.warn("html-to-image export failed, falling back to html2canvas:", e);
    }

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cloneRoot, {
      useCORS: true,
      backgroundColor: null,
      scale: Math.min(2, window.devicePixelRatio || 1),
    });

    await new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Failed to create blob"));
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    });
  } finally {
    wrapper.remove();
  }
}

export default exportElementToPng;