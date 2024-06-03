const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const csv = require("csv-parser");

const url = process.argv[2];
const csvFilePath = "./articles_rows.csv";

if (!url) {
  console.error("Please provide a URL as a command-line argument.");
  process.exit(1);
}

const getNextId = (filePath) => {
  return new Promise((resolve, reject) => {
    let maxId = 0;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const id = parseInt(row.id, 10);
        if (id > maxId) {
          maxId = id;
        }
      })
      .on("end", () => {
        resolve(maxId + 1);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

axios
  .get(url)
  .then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    // Using a more general selector if the specific class doesn't work
    const targetDiv = $('div[class*="jig-ncbiinpagena"]').text();

    if (!targetDiv) {
      console.error("No content found in the specified div.");
    } else {
      console.log("Content:", targetDiv);

      getNextId(csvFilePath)
        .then((nextId) => {
          const newRow = `\n${nextId},"${targetDiv.replace(/"/g, '""')}"\n`;
          fs.appendFile(csvFilePath, newRow, (err) => {
            if (err) {
              console.error("Error writing to CSV file:", err);
            } else {
              console.log("Content added to CSV file with ID:", nextId);
            }
          });
        })
        .catch((error) => {
          console.error("Error determining next ID:", error);
        });
    }
  })
  .catch((error) => {
    console.error("Error fetching the article:", error);
  });
