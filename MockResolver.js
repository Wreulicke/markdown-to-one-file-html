
var hyd = require('hydrolysis/lib/loader/fs-resolver')
var util= require('util')

util.inherits(MyResolver, hyd.FSResolver)

function MyResolver(proxiedUrl, content){
  this.proxiedUrl=proxiedUrl;
  this.content=content;
  hyd.FSResolver.prototype.constructor.call(this);
}

MyResolver.prototype.accept=function(uri, deffered, secondPath){
  if(path.relative(uri,this.proxiedUrl)!='')return hyd.FSResolver.prototype.accept.apply(this,arguments);
  else {
    deffered.resolve(this.content);
    return true
  }
}

module.exports=MyResolver;