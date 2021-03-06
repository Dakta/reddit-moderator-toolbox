var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
pageMod.PageMod({
  include: "*.reddit.com",
  contentScriptWhen: 'end',
  contentStyleFile : data.url("toolbox.css"),
  contentScriptFile: [data.url("jquery.js"), 
					  data.url("snuownd.js"), 
                      data.url("tbutils.js"), 
                      data.url("notifier.js"), 
                      data.url("domaintagger.js"), 
                      data.url("usernotes.js"), 
                      data.url("modbutton.js"), 
                      data.url("modmailpro.js"), 
                      data.url("modtools.js"), 
					  data.url("comment.js"), 
					  data.url("stattittab.js"), 
                      data.url("config.js")]
});