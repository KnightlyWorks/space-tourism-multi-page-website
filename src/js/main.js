import Alpine from "alpinejs";

const basePath = location.hostname === "localhost" ? "" : "/space-tourism-multi-page-website";

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

document.addEventListener("alpine:init", async () => {
  console.log("Alpine initialized");

  Alpine.store("navigation", {
    currentPage: window.location.pathname.split("/").pop() || "index.html",
    isCurrent(page) {
      return this.currentPage === page;
    },
  });

  // Fetch JSON с учётом basePath
  const rawData = await fetchData(`${basePath}/data/data.json`);
  if (!rawData) return; // Если fetch упал, прекращаем

  console.log("Fetched data:", rawData);

  // Сохраняем данные в Alpine.store без изменений путей
  Alpine.store("data", {
    destinations: rawData.destinations,
    crew: rawData.crew,
    technology: rawData.technology,
  });

  console.log(`Current page installed!`);
});

window.Alpine = Alpine;
Alpine.start();

console.log("App ready");
