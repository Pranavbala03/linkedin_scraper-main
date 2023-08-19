const puppeteer = require("puppeteer");
const { scrapeConnections } = require("./scripts/scrape_connections");
const { scrapeProfile } = require("./scripts/scrape_profile");

async function initialiseBrowser() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Emulate an iPhone 6 screen. This breakpoint makes it easier to scrape connections.
  const iPhone6 = puppeteer.devices["iPhone 6"];
  await page.emulate(iPhone6);

  return { browser, page };
}

async function loadCookies(cookiesData, page) {
  await page.setCookie(...cookiesData);
}

async function main(uuid) {
  const { browser, page } = await initialiseBrowser();

  // Your cookies JSON data here
  const cookiesData = [ ];

  await loadCookies(cookiesData, page);

  const options = {
    timeout: 60000, // Increase the timeout to 60 seconds
  };

  try {
    await page.waitForSelector("#connections", options);
    console.log("Found the #connections element");
    

    const vanityNames = await scrapeConnections(page);
    const vanityName = vanityNames[0];
    const profile = await scrapeProfile(page, vanityName);
  } catch (error) {
    console.error(`Error waiting for selector: ${error}`);
  } finally {
    await browser.close();
  }
}

main("");
