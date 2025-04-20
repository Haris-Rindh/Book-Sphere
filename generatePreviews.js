const fs = require("fs");
const path = require("path");

const books = require("./books.json");

// Folder to save preview HTMLs
const outputDir = path.join(__dirname, "previews");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Replace with your actual domain
const yourDomain = "https://yourdomain.com";

books.forEach((book) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${book.title}</title>
  <meta property="og:title" content="${book.title}" />
  <meta property="og:description" content="By ${book.author}" />
  <meta property="og:image" content="${book.cover}" />
  <meta property="og:url" content="${yourDomain}/previews/book-${book.id}.html" />
  <meta http-equiv="refresh" content="0; URL=../download.html?bookId=${book.id}" />
</head>
<body>
  <p>Redirecting to download page...</p>
</body>
</html>`.trim();

  fs.writeFileSync(path.join(outputDir, `book-${book.id}.html`), html, "utf8");
});

console.log("✅ All preview pages generated successfully!");
