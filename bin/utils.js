 exports.getInfo = function(base) {
     var index = base.lastIndexOf(".");
     return {
         ipBase: base.substr(0, index) + ".",
         startPort: parseInt(base.substr(index + 1, base.length))
     };
 }