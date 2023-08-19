// This is a LinkedIn scraper designed for Fizz.

const { scrapeConnections } = require('./scripts/scrape_connections');
const { scrapeProfile } = require('./scripts/scrape_profile');

const puppeteer = require("puppeteer");
const { scrollPageToBottom } = require("puppeteer-autoscroll-down");

async function initialiseBrowser() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Emulate an iPhone 6 screen. This breakpoint makes it easier to scrape connections.
  const iPhone6 = puppeteer.devices["iPhone 6"];
  await page.emulate(iPhone6);

  return {browser, page};
}

async function loadCookies(uuid: string, page) {
  // TODO: READ THIS!
  // * This is the part that still needs work. 
  // * Figure out how to load user cookies from Firebase. They will be stored in an encrypted manner using Evervault.
  // * I've temporarily kept [cookies] as a blank string to prevent errors.

  const cookies = '';
  
  const _cookies = JSON.parse(cookies);
  await page.setCookie(...cookies);
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function main(uuid: string) {
  let browser, page = await initialiseBrowser();
  await loadCookies(uuid, page);

  const vanityNames = await scrapeConnections(page);

  // TODO: READ THIS!
  // * I've shown an example below on how to scrape a single profile.
  // * Like I explained over the call, if you scrape too many users in too short of a timespan, LinkedIn may ban the IP and/or account.
  // * So figure how to optimise this for a first-time scrape, as well as subsequent scrapes that keep the user's network up-to-date.

  const vanityName = vanityNames[0];

  // * Returns user object with name, description, skills, contact info and experiences/
  // * Check scripts/scrape_profile.js for more info.
  const profile = await scrapeProfile(page, vanityName);

  await browser.close();
}



main('');