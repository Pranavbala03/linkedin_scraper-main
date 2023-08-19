async function scrapeConnections(page)  {
  const connectionsLink = 'https://www.linkedin.com/mynetwork/invite-connect/connections/?trk=profile';

  await page.goto(connectionsLink);

  console.log("Navigating to connections...");

  await page.waitForSelector('#connections');

  // Scroll through the entire lazy view.
  let lastPosition = 0;
  let shouldScroll = true;

  console.log("Starting scroll action...");

  while (shouldScroll) {
    const pos = await scrollPageToBottom(page, {
      size: 1000,
      delay: 200
    });
    
    if (pos==lastPosition) {
      shouldScroll = false;
    } else {
      lastPosition = pos;
    }

    await delay(1000);
  }

  console.log("Done scrolling.");

  const connections = await page.$$('#connections li');
  const vanityNames = await cleanupResults(connections);

  console.log(`User has ${vanityNames.length} connections.`);

  return vanityNames;
}

async function cleanupResults(connections) {
  let res = [];
  for (connection of connections) {
    const dataVanity = await connection.evaluate((el) => el.getAttribute("data-vanity"));
    if (dataVanity === null) continue;

    res.push(dataVanity);
  }

  return res;
}

module.exports = { scrapeConnections }