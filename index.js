var md = require('markdown-it');
var fs = require('fs')
var prism = require('prismjs')
var mustache = require('mustache')
var vulcanize = require('vulcanize')
var vulcan = new vulcanize({
  abspath: '',
  excludes: [],
  stripExcludes: [],
  inlineScripts: false,
  inlineCss: true,
  addedImports: [],
  redirects: [],
  implicitStrip: true,
  stripComments: false
})
var renderer = md({
  highlight: function(src, lang) {
    if (lang && prism.languages[lang]) {
      try {
        return prism.highlight(src, prism.languages[lang])
      } catch (error) {
        return src
      }
    }
    return '';
  }
})
fs.readFile('test.html', function(err, template) {
  if(err)throw err;
  fs.readFile('test.md', function(err, data) {
    if(err)throw err;
    var html = mustache.render(template.toString(), {
      content: renderer.render(data.toString())
    })
    fs.writeFile("temp.html",function(err){
      if(err)throw err;
      vulcan.process("temp.html", function(err, inlined) {
        if(err)throw err;
        fs.writeFile("result.html", html, function() {})
      })
    })
  })
})