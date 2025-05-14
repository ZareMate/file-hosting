import { useEffect } from "react";
import "github-markdown-css/github-markdown.css";

interface MarkdownRendererProps {
  markdownContent: string;
}

export function MarkdownRenderer({ markdownContent }: MarkdownRendererProps) {
  useEffect(() => {
    if (markdownContent) {
      const markdownContainer = document.querySelector("#markdown-preview");
      if (!markdownContainer) return;

      const codeBlocks = markdownContainer.querySelectorAll("code");

      codeBlocks.forEach((block) => {
        // Check if the block is already wrapped
        if (block.parentElement?.classList.contains("code-wrapper")) return;

        // Check if the code block is multiline
        const isMultiline = block.textContent?.includes("\n");
        if (!isMultiline) return;

        // Create a wrapper only if it doesn't already exist
        const wrapper = document.createElement("div");
        wrapper.className = "code-wrapper"; // Add a class to identify the wrapper
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "flex-start";
        wrapper.style.justifyContent = "space-between";
        wrapper.style.gap = "8px";
        wrapper.style.width = "100%";
        wrapper.style.position = "relative";

        const codeContainer = document.createElement("div");
        codeContainer.style.flex = "1";
        codeContainer.appendChild(block.cloneNode(true));

        const button = document.createElement("button");
        button.innerHTML = `
          <img src="/icons/copy.svg" alt="Copy" class="h-4 w-4" style="filter: invert(1) sepia(1) saturate(5) hue-rotate(180deg);"/>
        `;
        button.className =
          "copy-button inline-flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition";
        button.style.marginLeft = "8px";
        button.style.width = "1.5rem";
        button.style.height = "1.5rem";

        button.addEventListener("click", () => {
          navigator.clipboard.writeText(block.textContent || "").then(() => {
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            `;
            setTimeout(() => {
              button.innerHTML = `
                <img src="/icons/copy.svg" alt="Copy" class="h-4 w-4" style="filter: invert(1) sepia(1) saturate(5) hue-rotate(180deg);"/>
              `;
            }, 2000);
          });
        });

        wrapper.appendChild(codeContainer);
        wrapper.appendChild(button);

        // Replace the original block with the wrapper
        block.replaceWith(wrapper);
      });
    }
  }, [markdownContent]);

  return (
    <div className="markdown-body max-w-full p-4 pt-0 pb-0" id="markdown-preview">
      <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
    </div>
  );
}

