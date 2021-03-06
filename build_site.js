const fs = require('fs');
const handlebars = require('handlebars');
const marked = require('marked');
const path = require('path');
const slug = require('slug');
const rimraf = require('rimraf');



marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

function getBlogPostData(blogPostName) {
  var fileStr = fs.readFileSync('./writing/' + blogPostName, 'utf-8');

  const [dataStr, markdown] = fileStr.split('~---~', 2);
  const data = dataStr.split('\n').reduce((data, keyVal) => {
    const [key, val] = keyVal.split(':', 2);
    if (key && val) {
      data[key.trim()] = val.trim();
    }

    return data;
  }, {});

  if (!markdown) {
    throw new Error('No content in blog post');
  }
  data.slug = slug(data.title.toLowerCase());
  data.markdown = marked(markdown);

  return data;
}

function transformHandlebars(templateName, outputPath, data) {
  fs.readFile('./src/templates/' + templateName + '.handlebars', 'utf-8', function(error, source){
    if (error) {
      throw error;
    }

    fs.writeFileSync(
      outputPath,
      handlebars.compile(source)(data)
    );
  });
}

fs.readdir('./writing', (err, files) => {
  const blogPostData = [];
  console.log('Loading Blog Posts');
  files.forEach((file) => {
    if (path.extname(file) === '.md') {
      blogPostData.push(getBlogPostData(file));
    }
  });

  // Build Blog Posts
  console.log('Building Blog Posts');
  blogPostData.forEach((blogPostDatum) => {
    fs.access(blogPostDatum.slug, (err) => {
      if (err && err.code === "ENOENT") {
        fs.mkdirSync(blogPostDatum.slug);
      }

      transformHandlebars('blogpost', path.join(blogPostDatum.slug, 'index.html'), blogPostDatum);
    });
  });

  // Build Projects Page
  console.log('Building Projects Page');
  transformHandlebars('projects', 'index.html', {
    writings: blogPostData
  });
});
