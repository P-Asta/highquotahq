import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';

document.querySelectorAll(".guide-content").forEach(guide => {
    guide.innerHTML = guide.innerHTML.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  });
  



document.addEventListener("DOMContentLoaded", () => {
    const guideTitles = document.querySelectorAll(".guide-title");

    guideTitles.forEach((title) => {
      title.addEventListener("click", () => {
        const content = title.nextElementSibling;
        content.classList.toggle("active");
  
        // Dynamically adjust max-height for smooth expansion
        if (content.classList.contains("active")) {
          content.style.maxHeight = content.scrollHeight + "px";
        } else {
          content.style.maxHeight = "0";
        }
  
        // Collapse other open guides
        document.querySelectorAll(".guide-content").forEach((section) => {
          if (section !== content) {
            section.classList.remove("active");
            section.style.maxHeight = "0";
          }
        });
      });
    });
  });  

document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});