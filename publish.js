// read directory of files
// normalize
// spit out into publish
// include css
// include created at, last updated
var markdown = require( "markdown" ).markdown;
const prettify = require('html-prettify');
var fs = require('fs');
const WRITE_DIRECTORY = 'output'

// from https://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

function wrapTemplate (content) {
  let title = 'Mi post!'
  return `
   <html>
     <head>
        <title>${title}</title>
     </head>
     <body>
       ${content}
     </body>
   </html>
  `
}

readFiles('writing/', (filename, content) => {
  let renderedContent
  if (filename.match(/\.md$/)) {
    renderedContent = markdown.toHTML(content)
  } else if (filename.match(/\.html$/)) {
    renderedContent = content
  } else {
    console.error(`Unsupported file type ${filename}!`)
  }

  renderedContent = wrapTemplate(renderedContent)
  renderedContent = prettify(renderedContent)
  let cleanFilename = filename.replace(/\..+$/, '')
  fs.writeFile(`${WRITE_DIRECTORY}/${cleanFilename}.html`, renderedContent, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`Build ${filename}`)
    }
  })
}, console.error)
