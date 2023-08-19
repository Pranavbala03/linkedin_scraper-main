async function parseExperiences(page, experiencesElements) {
  let res = [];
  for (experienceLi of experiencesElements) {
    let info = undefined;

    const noCompanyInfo = await experienceLi.$('div > ul > li > div > dl');

    if (noCompanyInfo===null) {
      const withCompanyInfo = await experienceLi.$('div > ul > li > a > dl');
      info = withCompanyInfo;
    } else {
      info = noCompanyInfo;
    }

    const roleParentElement = await info.$('dt');
    const roleElement = await roleParentElement.$('span');
    const role = await page.evaluate((el)=>el.textContent, roleElement);

    const descriptions = await info.$$('dd');

    /*
    * There are 4 fields in the description:
    * 1. Company name
    * 2. Time frame
    * 3. Location
    * 4. Short text
    * Each one has to be parsed separately, because LinkedIn's page structure is absolutely abhorrent.
    */

    const companyElement = await descriptions[0].$('span');
    const company = await page.evaluate((el)=>el.textContent, companyElement);

    const timeframeElements = await descriptions[1].$$('span');
    const start = await page.evaluate((el)=>el.textContent, timeframeElements[0]);
    const end = await page.evaluate((el)=>el.textContent, timeframeElements[1]);
    const duration = await page.evaluate((el)=>el.textContent, timeframeElements[2]);
    const timeframe = {
      'Start':start,
      'End':end,
      'Duration':duration,
    };

    const locationElement = await descriptions[2].$('span');
    const location = await page.evaluate((el)=>el.textContent, locationElement);

    const shortTextElement = await descriptions[3].$('div');
    const shortText = await page.evaluate((el)=>el.textContent, shortTextElement);

    const experienceObject = {
      'Role':role,
      'Company':company,
      'Timeframe':timeframe,
      'Location':location,
      'Description':shortText,
    };

    res.push(experienceObject);
  }

  return res;
}

async function parseSkills(page, skillsElements) {
  let res = [];
  for (skillEle of skillsElements) {
    const children = await skillEle.$$('span');
    const skillElement = children[0];

    const skill = await page.evaluate((el)=>el.textContent, skillElement);
    res.push(skill);
  }

  return res;
}

async function parseContactInfo(page, contactInfoElements) {
  let res = {};

  for (contactInfoEle of contactInfoElements) {
    const infoContainer = (await contactInfoEle.$$('div'))[1];

    const labelElement = await infoContainer.$('p.contact-title.body-medium-bold.text-color-text');
    const label = await page.evaluate((el)=>el.textContent, labelElement);
    
    /* 
    * There are two possibilities here:
    * 1. There is just the <a> tag with a single element; and
    * 2. There is a <ul> tag with multiple elements.
    * So, we'll check for both possibilities before proceeding.
    */

    let content = undefined;

    const aTag = await infoContainer.$('a');
    const ulTag = await infoContainer.$('ul');

    if (aTag) {
      content = await page.evaluate((el)=>el.textContent, aTag);
    } else if (ulTag) {
      const items = await ulTag.$$('li > a');

      content = [];
      for (item of items) {
        const link = await page.evaluate((el)=>el.textContent, item);
        content.push(link);
      }
    }

    res[label] = content;
  }
  
  return res;
}

async function scrapeProfile(page, vanityName) {
  const link = `https://linkedin.com/in/${vanityName}`;

  await page.goto(link);
  await page.waitForSelector('dl.bg-color-background-container.mx-2.mt-2.mb-1');

  const mainInfo = await page.$('dl.bg-color-background-container.mx-2.mt-2.mb-1');
  
  const nameElement = await mainInfo.$('dt > h1');
  const name = await page.evaluate((el)=>el.textContent, nameElement);

  const descriptionElement = await page.$('div.body-small.text-color-text.whitespace-pre-line.description.truncated');
  const description = await page.evaluate((el)=>el.textContent, descriptionElement);

  const skillsElements = await page.$$('ol.skills-list > li');
  const skills = await parseSkills(page, skillsElements);

  const contactInfoElements = await page.$$('ul#contact-list > li');
  const contactInfo = await parseContactInfo(page, contactInfoElements);

  const experiencesElements = await page.$$('section.bg-color-background-container.experience-container.py-2.pl-2.mt-1.collapsible-list-container > ol > li');
  const { parseExperiences } = require('./scripts/experiences');
  const experiences = await parseExperiences(page, experiencesElements);

  
  // * This is the user object, returned as JSON.
  // * Check example_response.json for more info.
  const userObject = {
    'Name':name,
    'Description':description,
    'Skills':skills,
    'Contact':contactInfo,
    'Experiences':experiences,
  };

  return userObject;
}

module.exports = { scrapeProfile }