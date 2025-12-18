(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['audiorow'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"audio-row\">\n    <span class=\"audio-cell audio-cell-hn\">\n        <span class=\"audio-icon\"></span>\n        HN <kbd>"
    + alias4(((helper = (helper = lookupProperty(helpers,"hn") || (depth0 != null ? lookupProperty(depth0,"hn") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"hn","hash":{},"data":data,"loc":{"start":{"line":4,"column":16},"end":{"line":4,"column":22}}}) : helper)))
    + "</kbd>\n    </span>\n    <span class=\"audio-cell audio-cell-sg\">\n        <span class=\"audio-icon\"></span>\n        SG <kbd>"
    + alias4(((helper = (helper = lookupProperty(helpers,"sg") || (depth0 != null ? lookupProperty(depth0,"sg") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sg","hash":{},"data":data,"loc":{"start":{"line":8,"column":16},"end":{"line":8,"column":22}}}) : helper)))
    + "</kbd>\n    </span>\n</div>";
},"useData":true});
})();