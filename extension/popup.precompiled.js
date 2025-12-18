(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['popup'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "<div class=\"audio-row\">\n    <span class=\"audio-cell audio-cell-hn\">\n        <span class=\"audio-icon\"></span>\n        HN <kbd>Alt</kbd> + <kbd>W</kbd>\n    </span>\n    <span class=\"audio-cell audio-cell-sg\">\n        <span class=\"audio-icon\"></span>\n        SG <kbd>Alt</kbd> + <kbd>D</kbd>\n    </span>\n</div>\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"entry\">\n        <div class=\"headword-row\">\n            "
    + alias4(((helper = (helper = lookupProperty(helpers,"word") || (depth0 != null ? lookupProperty(depth0,"word") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"word","hash":{},"data":data,"loc":{"start":{"line":18,"column":12},"end":{"line":18,"column":20}}}) : helper)))
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"alt_spelling") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":12},"end":{"line":21,"column":19}}})) != null ? stack1 : "")
    + "            "
    + ((stack1 = (lookupProperty(helpers,"rankBadge")||(depth0 && lookupProperty(depth0,"rankBadge"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"rank") : depth0),{"name":"rankBadge","hash":{},"data":data,"loc":{"start":{"line":22,"column":12},"end":{"line":22,"column":32}}})) != null ? stack1 : "")
    + "\n        </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"phonetic_hn") : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":25,"column":8},"end":{"line":30,"column":15}}})) != null ? stack1 : "")
    + "        <div class=\"ipa\">\n            <span class=\"hn\"><strong>HN</strong> /"
    + alias4(((helper = (helper = lookupProperty(helpers,"ipa_hn") || (depth0 != null ? lookupProperty(depth0,"ipa_hn") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ipa_hn","hash":{},"data":data,"loc":{"start":{"line":32,"column":50},"end":{"line":32,"column":60}}}) : helper)))
    + "/</span>\n            <span class=\"sg\"><strong>SG</strong> /"
    + alias4(((helper = (helper = lookupProperty(helpers,"ipa_sg") || (depth0 != null ? lookupProperty(depth0,"ipa_sg") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ipa_sg","hash":{},"data":data,"loc":{"start":{"line":33,"column":50},"end":{"line":33,"column":60}}}) : helper)))
    + "/</span>\n        </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"lexemes") : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":36,"column":8},"end":{"line":56,"column":17}}})) != null ? stack1 : "")
    + "    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <span class=\"alt-spelling\">(<em>also:</em> <strong>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"alt_spelling") || (depth0 != null ? lookupProperty(depth0,"alt_spelling") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"alt_spelling","hash":{},"data":data,"loc":{"start":{"line":20,"column":67},"end":{"line":20,"column":83}}}) : helper)))
    + "</strong>)</span>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"phonetic\">\n            <span class=\"hn\"><strong>HN</strong> <em>"
    + alias4(((helper = (helper = lookupProperty(helpers,"phonetic_hn") || (depth0 != null ? lookupProperty(depth0,"phonetic_hn") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"phonetic_hn","hash":{},"data":data,"loc":{"start":{"line":27,"column":53},"end":{"line":27,"column":68}}}) : helper)))
    + "</em></span>\n            <span class=\"sg\"><strong>SG</strong> <em>"
    + alias4(((helper = (helper = lookupProperty(helpers,"phonetic_sg") || (depth0 != null ? lookupProperty(depth0,"phonetic_sg") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"phonetic_sg","hash":{},"data":data,"loc":{"start":{"line":28,"column":53},"end":{"line":28,"column":68}}}) : helper)))
    + "</em></span>\n        </div>\n";
},"8":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"lexeme\">\n            <span class=\"pos-heading\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"pos") || (depth0 != null ? lookupProperty(depth0,"pos") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"pos","hash":{},"data":data,"loc":{"start":{"line":38,"column":38},"end":{"line":38,"column":45}}}) : helper)))
    + "</span>\n            "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"classifier") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":39,"column":12},"end":{"line":39,"column":123}}})) != null ? stack1 : "")
    + "\n            <div class=\"senses\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"senses") : depth0),{"name":"each","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":16},"end":{"line":53,"column":25}}})) != null ? stack1 : "")
    + "            </div>\n        </div>\n";
},"9":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<span class=\"classifier\">(<em>classifier:</em> <strong>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"classifier") || (depth0 != null ? lookupProperty(depth0,"classifier") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"classifier","hash":{},"data":data,"loc":{"start":{"line":39,"column":85},"end":{"line":39,"column":99}}}) : helper)))
    + "</strong>)</span>";
},"11":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div class=\"sense "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"eq")||(depth0 && lookupProperty(depth0,"eq"))||alias2).call(alias1,((stack1 = (depths[1] != null ? lookupProperty(depths[1],"senses") : depths[1])) != null ? lookupProperty(stack1,"length") : stack1),1,{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":42,"column":40},"end":{"line":42,"column":63}}}),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":42,"column":34},"end":{"line":42,"column":79}}})) != null ? stack1 : "")
    + "\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"tags") : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":20},"end":{"line":47,"column":27}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"qualifiers") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":48,"column":20},"end":{"line":50,"column":27}}})) != null ? stack1 : "")
    + "                    "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"gloss") || (depth0 != null ? lookupProperty(depth0,"gloss") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"gloss","hash":{},"data":data,"loc":{"start":{"line":51,"column":20},"end":{"line":51,"column":29}}}) : helper)))
    + "\n                </div>\n";
},"12":function(container,depth0,helpers,partials,data) {
    return "single";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <ul class=\"tags\">\n                        "
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"tags") : depth0),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":45,"column":24},"end":{"line":45,"column":76}}})) != null ? stack1 : "")
    + "\n                    </ul>\n";
},"15":function(container,depth0,helpers,partials,data) {
    return "<li class=\"tag\">"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</li>";
},"17":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <span class=\"qualifiers\">"
    + container.escapeExpression((lookupProperty(helpers,"join")||(depth0 && lookupProperty(depth0,"join"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"qualifiers") : depth0),", ",{"name":"join","hash":{},"data":data,"loc":{"start":{"line":49,"column":45},"end":{"line":49,"column":69}}}))
    + "</span>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasAudio") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + "\n<div class=\"entries\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"entries") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":4},"end":{"line":58,"column":13}}})) != null ? stack1 : "")
    + "</div>";
},"useData":true,"useDepths":true});
})();