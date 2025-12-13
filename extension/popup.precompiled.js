(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['popup'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <span class=\"alt-spelling\">(<em>also:</em> <strong>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"alt_spelling") || (depth0 != null ? lookupProperty(depth0,"alt_spelling") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"alt_spelling","hash":{},"data":data,"loc":{"start":{"line":5,"column":63},"end":{"line":5,"column":79}}}) : helper)))
    + "</strong>)</span>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = (lookupProperty(helpers,"audioButton")||(depth0 && lookupProperty(depth0,"audioButton"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"word") : depth0),"hn",{"name":"audioButton","hash":{},"data":data,"loc":{"start":{"line":7,"column":25},"end":{"line":7,"column":52}}})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = (lookupProperty(helpers,"audioButton")||(depth0 && lookupProperty(depth0,"audioButton"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"word") : depth0),"sg",{"name":"audioButton","hash":{},"data":data,"loc":{"start":{"line":8,"column":25},"end":{"line":8,"column":52}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"phonetic\">\n        <strong>HN</strong> <em>"
    + alias4(((helper = (helper = lookupProperty(helpers,"phonetic_hn") || (depth0 != null ? lookupProperty(depth0,"phonetic_hn") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"phonetic_hn","hash":{},"data":data,"loc":{"start":{"line":14,"column":32},"end":{"line":14,"column":47}}}) : helper)))
    + "</em> <strong>SG</strong> <em>"
    + alias4(((helper = (helper = lookupProperty(helpers,"phonetic_sg") || (depth0 != null ? lookupProperty(depth0,"phonetic_sg") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"phonetic_sg","hash":{},"data":data,"loc":{"start":{"line":14,"column":77},"end":{"line":14,"column":92}}}) : helper)))
    + "</em>\n    </div>\n";
},"9":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"lexeme\">\n        <span class=\"pos-heading\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"pos") || (depth0 != null ? lookupProperty(depth0,"pos") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"pos","hash":{},"data":data,"loc":{"start":{"line":23,"column":34},"end":{"line":23,"column":41}}}) : helper)))
    + "</span>\n        "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"classifier") : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":24,"column":8},"end":{"line":24,"column":119}}})) != null ? stack1 : "")
    + "\n        <div class=\"senses\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"senses") : depth0),{"name":"each","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":12},"end":{"line":38,"column":21}}})) != null ? stack1 : "")
    + "        </div>\n    </div>\n";
},"10":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<span class=\"classifier\">(<em>classifier:</em> <strong>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"classifier") || (depth0 != null ? lookupProperty(depth0,"classifier") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"classifier","hash":{},"data":data,"loc":{"start":{"line":24,"column":81},"end":{"line":24,"column":95}}}) : helper)))
    + "</strong>)</span>";
},"12":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"sense "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"eq")||(depth0 && lookupProperty(depth0,"eq"))||alias2).call(alias1,((stack1 = (depths[1] != null ? lookupProperty(depths[1],"senses") : depths[1])) != null ? lookupProperty(stack1,"length") : stack1),1,{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":27,"column":36},"end":{"line":27,"column":59}}}),{"name":"if","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":30},"end":{"line":27,"column":75}}})) != null ? stack1 : "")
    + "\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"tags") : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":16},"end":{"line":32,"column":23}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"qualifiers") : depth0),{"name":"if","hash":{},"fn":container.program(18, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":16},"end":{"line":35,"column":23}}})) != null ? stack1 : "")
    + "                "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"gloss") || (depth0 != null ? lookupProperty(depth0,"gloss") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"gloss","hash":{},"data":data,"loc":{"start":{"line":36,"column":16},"end":{"line":36,"column":25}}}) : helper)))
    + "\n            </div>\n";
},"13":function(container,depth0,helpers,partials,data) {
    return "single";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <ul class=\"tags\">\n                    "
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"tags") : depth0),{"name":"each","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":20},"end":{"line":30,"column":72}}})) != null ? stack1 : "")
    + "\n                </ul>\n";
},"16":function(container,depth0,helpers,partials,data) {
    return "<li class=\"tag\">"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</li>";
},"18":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <span class=\"qualifiers\">"
    + container.escapeExpression((lookupProperty(helpers,"join")||(depth0 && lookupProperty(depth0,"join"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"qualifiers") : depth0),", ",{"name":"join","hash":{},"data":data,"loc":{"start":{"line":34,"column":41},"end":{"line":34,"column":65}}}))
    + "</span>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"saola-popup-result\">\n    <div class=\"headword-row\">\n        "
    + alias4(((helper = (helper = lookupProperty(helpers,"word") || (depth0 != null ? lookupProperty(depth0,"word") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"word","hash":{},"data":data,"loc":{"start":{"line":3,"column":8},"end":{"line":3,"column":16}}}) : helper)))
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"alt_spelling") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":6,"column":15}}})) != null ? stack1 : "")
    + "        "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"has_audio") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":8},"end":{"line":7,"column":59}}})) != null ? stack1 : "")
    + "\n        "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"has_audio") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":8},"end":{"line":8,"column":59}}})) != null ? stack1 : "")
    + "\n        "
    + ((stack1 = (lookupProperty(helpers,"rankBadge")||(depth0 && lookupProperty(depth0,"rankBadge"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"rank") : depth0),{"name":"rankBadge","hash":{},"data":data,"loc":{"start":{"line":9,"column":8},"end":{"line":9,"column":28}}})) != null ? stack1 : "")
    + "\n    </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"phonetic_hn") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":4},"end":{"line":16,"column":11}}})) != null ? stack1 : "")
    + "    <div class=\"ipa\">\n        <strong>HN</strong> /"
    + alias4(((helper = (helper = lookupProperty(helpers,"ipa_hn") || (depth0 != null ? lookupProperty(depth0,"ipa_hn") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ipa_hn","hash":{},"data":data,"loc":{"start":{"line":18,"column":29},"end":{"line":18,"column":39}}}) : helper)))
    + "/ <strong>SG</strong> /"
    + alias4(((helper = (helper = lookupProperty(helpers,"ipa_sg") || (depth0 != null ? lookupProperty(depth0,"ipa_sg") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ipa_sg","hash":{},"data":data,"loc":{"start":{"line":18,"column":62},"end":{"line":18,"column":72}}}) : helper)))
    + "/\n    </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"lexemes") : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":4},"end":{"line":41,"column":13}}})) != null ? stack1 : "")
    + "</div>";
},"useData":true,"useDepths":true});
})();