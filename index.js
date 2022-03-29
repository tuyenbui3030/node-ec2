const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const express = require('express');
const url = require("url");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 2608

const process = async (username, password) => {
  // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.rakuten-sec.co.jp/", {
    waitUntil: "networkidle0",
  });
  await page.type("#form-login-id", username);
  await page.type("#form-login-pass", password);
  // click and wait for navigation
  await Promise.all([
    page.click("#login-btn"),
    page.waitForNavigation(),
  ]);
  const sessionId = getSession(page.url());
  await page.goto(
    `https://member.rakuten-sec.co.jp/app/market_top.do;BV_SessionID=${sessionId}`
  );
  const options = await page.evaluate(() => {
    const options = document.getElementById("rankingType").options;
    const result = [];
    Array.apply(null, { length: options.length })
      .map(Number.call, Number)
      .forEach((element) => {
        result.push(options[element].value);
      });
    return result;
  });
  const result = [];
  for (let index = 0; index < options.length; index++) {
    if (options[index] === "––––––––––––––––––") {
      continue;
    } else {
      result.push(await dynamicSelect(options[index], page));
    }
  }
  await browser.close();
  return result;
};

const dynamicSelect = async (el, page) => {
  await page.select("#rankingType", el);
  let $ = cheerio.load(await page.content());
  let tableIsEmpty = $("#ranking_body").children().length;
  while (tableIsEmpty < 1) {
    $ = cheerio.load(await page.content());
    tableIsEmpty = $("#ranking_body").children().length;
  }
  // tableIsEmpty = $('#ranking_body').html();
  let rows = [];
  $("#ranking_body > tr").each((ndex, element) => {
    let row = []
    row.push($($(element).find("td")[0]).text());
    row.push($($(element).find("td")[1]).text());
    row.push($($(element).find("td")[2]).text());
    row.push($($(element).find("td")[3]).text());
    row.push($($(element).find("td")[4]).text());
    rows.push(row);
  });
  console.log("-----Data động-----")
  // console.log(rows);
  return rows;
};

const getSession = (fullUrl) => {
  const urlParts = url.parse(fullUrl, true);
  return urlParts.query.BV_SessionID;
};
app.get('/tobibui', (req, res) => {
  res.send("bebebebe");
})
app.post('/tuyenbui', async (req, res) => {
  const {username, password} = req.body;
  try {
    console.log("Vô");
    const a = await process(username, password);
    res.send({
      message: 'Success',
      data: a
    })
  } catch (error) {
    console.log("Lỗi", error)
    res.send({
      message: 'faile',
      error: error
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})