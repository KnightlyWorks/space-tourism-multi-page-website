import Alpine from "alpinejs";

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

  const rawData = await fetchData("/data/data.json");

  // Используем данные как есть, без мутации путей
  console.log(rawData);

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
