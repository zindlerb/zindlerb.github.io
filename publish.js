// parse notion
  // mimic render
// remove style
// clean up tags
// inject styles
// get images working

const cheerio = require('cheerio')
var tidy = require("tidy-html5").tidy_html5
var markdown = require( "markdown" ).markdown;
var fs = require('fs');
const path = require('path');
const WRITE_DIRECTORY = 'output'

let notion = false
let args = Array.from(process.argv).slice(2)
if (args.indexOf('--notion') > -1) {
  notion = true
}
let directoryPath = args.pop() || 'writing/'
directoryPath = path.resolve(__dirname, directoryPath)
if (!directoryPath.match(/\/$/)) {
  directoryPath = `${directoryPath}/`
}

// from https://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      if (filename.match(/\.(md|html)$/)) {
        fs.readFile(dirname + filename, 'utf-8', function(err, content) {
          if (err) {
            onError(err);
            return;
          }
          onFileContent(filename, content);
        });
      }
    });
  });
}

function wrapTemplate (content) {
  let title = 'Mi post!'
  return `
   <html>
     <head>
<link href="https://fonts.googleapis.com/css2?family=Alegreya+Sans:ital,wght@0,100;0,300;0,400;0,500;0,700;0,800;0,900;1,100;1,300;1,400;1,500;1,700;1,800;1,900&family=Alegreya:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400;1,500;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400;1,500;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&family=Source+Serif+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap" rel="stylesheet">
        <title>${title}</title>
     </head>
     <body>
       <div class='header'>
         <a href='/'>Brian Zindler</a>
         <a href='/newsletter'>Newsletter</a>
       </div>
       ${content}
       <link rel="stylesheet" href="assets/style.css">
     </body>
   </html>
  `
}

function formatNode (node) {
  let attributes = []
  for (let attribute of node.attributes) {
    attributes.push(`${attribute.name}=${attribute.value}`)
  }

  return {
    open: `<${node.tagName.toLowerCase()} ${attributes.join(' ')} >`,
    close: `<${node.tagName.toLowerCase()}/>`
  }
}

/*
  get those images working
*/

function formatNotionImgSrc (prettyFilename, imgName) {
  return `/assets/${prettyFilename}_${imgName}`
}

function reformatNotionHtml (content, prettyFilename) {
  const $ = cheerio.load(content)
  $('style').remove()

  $('*[id]').each((i, node) => {
    delete node.attribs.id
  })

  $('img').each((i, node) => {
    let url = node.attribs.src
    let [_, imgName] = url.split('/')
    node.attribs.src = formatNotionImgSrc(prettyFilename, imgName)
  })

  return $.html()
}

function transferAssets (dirname, prettyFilename) {
  let assetsDirname = `${WRITE_DIRECTORY}/assets`
  if (!fs.existsSync(assetsDirname)){
    fs.mkdirSync(assetsDirname);
  }

  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      throw err
    }

    filenames.forEach(function(imgFilename) {
      fs.copyFile(
        `${dirname}${imgFilename}`,
        `${WRITE_DIRECTORY}/${formatNotionImgSrc(prettyFilename, imgFilename)}`,
        (err) => {
          if (err) {
            console.error(err)
          }
        }
      )
    });
  });
}

readFiles(directoryPath, (filename, content) => {
  let renderedContent
  let prettyFilename = filename
  if (notion) {
    prettyFilename = prettyFilename
      .replace(/\s/g, '_')
      .replace(/(_[^_]+)(\.html)$/, '$2')
      .replace(/\..+$/, '')
      .toLowerCase()
      .trim()
  } else {
    prettyFilename = prettyFilename.replace(/\..+$/, '')
  }

  if (filename.match(/\.md$/)) {
    renderedContent = markdown.toHTML(content)
  } else if (filename.match(/\.html$/)) {
    renderedContent = content
    if (notion) {
      renderedContent = reformatNotionHtml(renderedContent, prettyFilename)
    }
  } else {
    console.error(`Unsupported file type ${filename}!`)
  }

  if (notion) {
    transferAssets(`${directoryPath}${filename.replace(/\..+$/, '')}/`, prettyFilename)
  }

  renderedContent = wrapTemplate(renderedContent)
  renderedContent = tidy(renderedContent, {"indent-spaces": 2, 'quiet': true, 'show-warnings': false})
  fs.writeFile(`${WRITE_DIRECTORY}/${prettyFilename}.html`, renderedContent, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`BUILD: ${WRITE_DIRECTORY}/${prettyFilename}.html`)
    }
  })
}, console.error)
