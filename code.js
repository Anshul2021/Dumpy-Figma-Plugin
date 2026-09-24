// Dumpy - Real-Time Screenshot Inbox for Figma
// Main Plugin Sandbox Code (code.js)

figma.showUI(__html__, {
  width: 390,
  height: 640,
  themeColors: true,
  title: "Dumpy — Screenshot Inbox"
});

// Helper: Scan page for top-level Figma SectionNodes
function getPageSections() {
  const sections = [];
  try {
    const children = figma.currentPage.children || [];
    for (const node of children) {
      if (node.type === "SECTION") {
        sections.push({
          id: node.id,
          name: node.name
        });
      }
    }
  } catch (err) {
    console.error("Error fetching sections:", err);
  }
  return sections;
}

// Helper: Create a styled Figma SectionNode
function createDumpySection(name) {
  const section = figma.createSection();
  const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  section.name = name || `Mobile Screenshots (${dateStr})`;
  
  // Position section at current viewport center
  const center = figma.viewport.center;
  section.x = Math.round(center.x - 400);
  section.y = Math.round(center.y - 300);
  
  // Add subtle stylish background color to section (Soft slate)
  section.fills = [{
    type: 'SOLID',
    color: { r: 0.96, g: 0.97, b: 0.98 },
    opacity: 1
  }];
  
  figma.currentPage.appendChild(section);
  return section;
}

// Helper: Convert array or Uint8Array safely to Uint8Array
function toUint8Array(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (Array.isArray(data)) return new Uint8Array(data);
  if (data && data.buffer) return new Uint8Array(data.buffer);
  throw new Error("Invalid image byte format received");
}

// Handle messages from Plugin UI
figma.ui.onmessage = async (msg) => {
  try {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case "INIT": {
        const savedSectionId = await figma.clientStorage.getAsync("dumpy_preferred_section_id");
        const sections = getPageSections();

        figma.ui.postMessage({
          type: "INIT_RESPONSE",
          savedSectionId: savedSectionId || null,
          sections: sections
        });
        break;
      }

      case "OPEN_EXTERNAL": {
        if (msg.url) {
          figma.openExternal(msg.url);
        }
        break;
      }

      case "GET_SECTIONS": {
        const sections = getPageSections();
        figma.ui.postMessage({
          type: "SECTIONS_LIST",
          sections: sections
        });
        break;
      }

      case "CREATE_SECTION": {
        const section = createDumpySection(msg.name);
        const sections = getPageSections();
        figma.ui.postMessage({
          type: "SECTION_CREATED",
          sectionId: section.id,
          sectionName: section.name,
          sections: sections
        });
        figma.notify(`Created Section "${section.name}"`);
        break;
      }

      case "SAVE_STORAGE": {
        if (msg.key) {
          await figma.clientStorage.setAsync(msg.key, msg.value);
        }
        break;
      }

      case "RESIZE_WINDOW": {
        if (msg.width && msg.height) {
          figma.ui.resize(Math.round(msg.width), Math.round(msg.height));
        }
        break;
      }

      case "NOTIFY": {
        figma.notify(msg.message || "", {
          error: !!msg.isError,
          timeout: msg.timeout || 3000
        });
        break;
      }

      case "INSERT_SINGLE_IMAGE": {
        const bytes = toUint8Array(msg.bytes);
        const image = figma.createImage(bytes);
        
        // Target dimensions (standard mobile display width in Figma is ~375px or proportional)
        const targetWidth = msg.targetWidth || 375;
        const originalWidth = msg.width || 375;
        const originalHeight = msg.height || 812;
        const aspectRatio = originalHeight / originalWidth;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        const rect = figma.createRectangle();
        rect.name = msg.name || "Screenshot";
        rect.resize(targetWidth, targetHeight);
        rect.cornerRadius = 16;
        rect.fills = [{
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: image.hash
        }];

        // Subtle drop shadow for realism
        rect.effects = [{
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.08 },
          offset: { x: 0, y: 8 },
          radius: 20,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL'
        }];

        // Place into Section or canvas
        let targetSection = null;
        if (msg.sectionId) {
          const found = await figma.getNodeByIdAsync(msg.sectionId);
          if (found && found.type === "SECTION") {
            targetSection = found;
          }
        }

        if (targetSection) {
          // Find next position inside section
          const padding = 48;
          let maxY = padding;
          let maxX = padding;
          for (const child of targetSection.children) {
            const bottom = child.y + child.height;
            if (bottom > maxY) maxY = bottom;
            const right = child.x + child.width;
            if (right > maxX) maxX = right;
          }

          rect.x = padding;
          rect.y = targetSection.children.length > 0 ? maxY + 32 : padding;
          targetSection.appendChild(rect);

          // Auto-expand section size
          const neededWidth = Math.max(targetSection.width, rect.x + rect.width + padding);
          const neededHeight = Math.max(targetSection.height, rect.y + rect.height + padding);
          targetSection.resizeWithoutConstraints(neededWidth, neededHeight);

          figma.currentPage.selection = [rect];
          figma.viewport.scrollAndZoomIntoView([rect]);
          figma.notify(`Inserted "${rect.name}" into "${targetSection.name}"`);
        } else {
          // Free canvas insertion near center
          const center = figma.viewport.center;
          rect.x = Math.round(center.x - targetWidth / 2);
          rect.y = Math.round(center.y - targetHeight / 2);
          figma.currentPage.appendChild(rect);
          figma.currentPage.selection = [rect];
          figma.viewport.scrollAndZoomIntoView([rect]);
          figma.notify(`Inserted "${rect.name}"`);
        }

        figma.ui.postMessage({
          type: "IMAGE_INSERTED",
          id: msg.id,
          figmaNodeId: rect.id
        });
        break;
      }

      case "INSERT_BATCH": {
        const items = msg.items || [];
        if (items.length === 0) {
          figma.notify("No screenshots selected to insert", { error: true });
          return;
        }

        // 1. Resolve or Create Target Section
        let section = null;
        if (msg.sectionId) {
          const found = await figma.getNodeByIdAsync(msg.sectionId);
          if (found && found.type === "SECTION") {
            section = found;
          }
        }

        if (!section) {
          section = createDumpySection(msg.newSectionName || "Mobile Screenshots");
        }

        const padding = 48;
        const gap = 32;
        const cardWidth = 360;
        const columns = Math.min(Math.max(msg.columns || 3, 1), 6);

        // Keep track of column vertical offsets inside section for balanced layout
        const columnHeights = new Array(columns).fill(padding);
        const createdNodes = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const bytes = toUint8Array(item.bytes);
          const image = figma.createImage(bytes);

          const origW = item.width || 375;
          const origH = item.height || 812;
          const aspect = origH / origW;
          const cardHeight = Math.round(cardWidth * aspect);

          // Find shortest column for masonry-like grid packing
          let shortestCol = 0;
          for (let c = 1; c < columns; c++) {
            if (columnHeights[c] < columnHeights[shortestCol]) {
              shortestCol = c;
            }
          }

          const nodeX = padding + shortestCol * (cardWidth + gap);
          const nodeY = columnHeights[shortestCol];

          const rect = figma.createRectangle();
          rect.name = item.name || `Screenshot ${i + 1}`;
          rect.resize(cardWidth, cardHeight);
          rect.cornerRadius = 16;
          rect.fills = [{
            type: 'IMAGE',
            scaleMode: 'FILL',
            imageHash: image.hash
          }];
          rect.effects = [{
            type: 'DROP_SHADOW',
            color: { r: 0, g: 0, b: 0, a: 0.08 },
            offset: { x: 0, y: 8 },
            radius: 20,
            spread: 0,
            visible: true,
            blendMode: 'NORMAL'
          }];

          rect.x = nodeX;
          rect.y = nodeY;

          section.appendChild(rect);
          createdNodes.push(rect);

          // Advance column height
          columnHeights[shortestCol] += cardHeight + gap;
        }

        // Resize section to wrap all nodes + padding
        const maxColHeight = Math.max(...columnHeights);
        const totalWidth = padding * 2 + columns * cardWidth + (columns - 1) * gap;
        const totalHeight = maxColHeight + padding - gap;

        section.resizeWithoutConstraints(totalWidth, totalHeight);

        // Select and focus on section
        figma.currentPage.selection = [section];
        figma.viewport.scrollAndZoomIntoView([section]);

        figma.notify(`✨ Inserted ${items.length} screenshots into "${section.name}"`);

        figma.ui.postMessage({
          type: "BATCH_INSERTED",
          insertedIds: items.map(it => it.id),
          sectionId: section.id
        });
        break;
      }
    }
  } catch (err) {
    console.error("Dumpy Plugin Error:", err);
    figma.notify(`Error: ${err.message || err}`, { error: true });
    figma.ui.postMessage({
      type: "ERROR",
      message: err.message || String(err)
    });
  }
};
