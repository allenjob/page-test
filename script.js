const yearElement = document.getElementById("year");
const copyButton = document.getElementById("copyButton");
const copyFeedback = document.getElementById("copyFeedback");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (copyButton && copyFeedback) {
  copyButton.addEventListener("click", async () => {
    const copyText = copyButton.dataset.copy || "";

    try {
      await navigator.clipboard.writeText(copyText);
      copyFeedback.textContent = "Copied successfully.";
    } catch (error) {
      copyFeedback.textContent = copyText;
    }
  });
}
