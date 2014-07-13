function tbconfig() {
    if (!TBUtils.logged || !TBUtils.getSetting('TBConfig', 'enabled', true))
        return;
    $.log('Loading Configuration Module');
    
    var $body = $('body');

    var toolbox = $('#moderation_tools').find('.content .icon-menu'),
        configLink = '<li><img src="data:image/png;base64,' + TBui.iconWrench + '"/><span class="separator"></span><a href="javascript:;" class="toolbox-edit" title="toolbox configuration for this subreddit">toolbox configuration</a></li>',
        //configLink = '<li><a href="javascript:;" class="toolbox-edit" title="toolbox configuration for this subreddit">toolbox configuration</a></li>',
        subreddit = TBUtils.post_site,
        config = TBUtils.config;

    if (!subreddit) return;

    $.getJSON('http://www.reddit.com/r/' + subreddit + '/wiki/toolbox.json', function (json) {
        if (json.data.content_md) {
            config = JSON.parse(json.data.content_md);
        }
        init();
    }).error(function () {
        init();
    });

    function init() {
        $(toolbox).append(configLink);
    }

    $body.on('click', '.toolbox-edit', function () {
        showSettings();
    });

    function postToWiki(page, data, reason, isJSON, updateAM) {
        $.log("posting to wiki");
        TBUtils.postToWiki(page, subreddit, data, reason, isJSON, updateAM, function done(succ, err) {
            $.log("save succ = " + succ);
            if (!succ) {
                $.log(err.responseText, true)
            } else {
                $.log("clearing cache");
                TBUtils.clearCache();
            }
        });
    }

    function showSettings() {

        // No reasons storred in the config.  Check the CSS.
        if (!config.removalReasons || config.removalReasons.reasons.length < 1) {
            TBUtils.getReasonsFromCSS(subreddit, function (resp) {
                if (resp) {
                    $('.reasons-notice').show();

                    // Save old removal reasosns when clicked.
                    $('.update-reasons').click(function () {
                        config.removalReasons = resp;

                        postToWiki('toolbox', config, 'import removal reasons from CSS', true);

                        $('.reasons-notice').hide();
                    });
                }
            });
        }

        var html = '\
<div class="tb-page-overlay tb-settings" comment="the white fade out over the page, we can do without, personally like it">\
    <div class="tb-window-wrapper" comment="the window itself">\
        <div class="tb-window-header" comment="This will contain the name of the window">\
            Toolbox Configuration - /r/' + subreddit + '\
            <span class="tb-window-header-options"><a class="tb-config-help" href="javascript:;" title="Toolbox Configuration Help">?</a> - <a class="tb-close" title="Close Toolbox Configuration" href="javascript:;">✕</a></span>\
        </div>\
        <div class="tb-form">\
            <div class="tb-window-tabs">\
                <a target="_blank" href="http://www.reddit.com/r/' + subreddit + '/wiki/pages" >wiki page listing</a>\
                <a href="javascript:;" class="edit-wiki-page" page="toolbox">edit toolbox config</a>\
                <a href="javascript:;" class="edit-wiki-page" page="usernotes">edit user notes</a>\
                <a href="javascript:;" class="edit-wiki-page" page="automoderator">edit automoderator config</a>\
                <span class="tb-window-spacer">&nbsp;</span>\
                <a class="reason-settings" href="javascript:;">removal reason settings</a><a class="edit-reasons" href="javascript:;">edit removal reasons</a>\
                <a class="edit-domains" href="javascript:;">domain tags</a>\
                <!--<a class="tb-local-settings" href="javascript:;">toolbox settings</a><br>-->\
            </div>\
            <div class="tb-window-content" comment="This will contain all other elements, this is basically a wrapper to give is more flexibility in the future">\
                <div class="wiki-edit-area" style="display: none;">\
                    <textarea class="edit-wikidata" rows="20" cols="20" style="display: none;"></textarea><br>\
                    <div id="edit-wikidata-div" style="display: none; height: 500px;"></div><br>\
                    <input type="text" name="edit-wikidata-note" placeholder="wiki page revision reason (optional)" />\
                </div>\
                <div class="reasons-notice" style="display:none;">\
                    <br><br>\
                    <p>\
                        Removal reasons were found in your CSS but have not been saved to the wiki configuration page.<br />\
                        You will need to save them to the wiki before you can edit them. &nbsp;Would you like to do so now?<br />\
                        <a class="update-reasons" href="javascript:;">Save removal reasons to wiki</a> (note: this requires that you have wiki editing permisissions)\
                    </p>\
                </div>\
            </div>\
            <div class="tb-window-footer" >\
                <div class="wiki-edit-area" style="display: none;">\
                    <input class="save-wiki-data" type="button" value="Save Page to Wiki"></input>&nbsp;&nbsp;\
                    <input class="cancel-wiki-data" type="button" value="Cancel"></input>\
                </div>\
            </div>\
        </div>\
        <div class="tb-help-config-content">Choose what you want to edit.</div>\
    </div>\
</div>\
        ';
        $(html).appendTo('body').show();
        $body.css('overflow', 'hidden');
    }

    $body.on('click', '.tb-close', function () {
        $('.tb-settings').remove();
        $body.css('overflow', 'auto');
    });

    $body.on('click', '.edit-domains', function () {

        var html = $('\
<div class="tb-page-overlay edit-domains-form " comment="the white fade out over the page, we can do without, personally like it">\
<div class="tb-window-wrapper-two" comment="the window itself">\
<div class="tb-window-header" comment="This will contain the name of the window"> Edit domains <span class="tb-window-header-options"><a class="tb-config-help" href="javascript:;">?</a> - <a class="cancel" href="javascript:;">✕</a></span></div>\
<div class="tb-window-content" comment="This will contain all other elements, this is basically a wrapper to give is more flexibility in the future">\
\
\
<div class="tb-form">\
<p>import tags from /r/:&nbsp;<input class="importfrom" type="text"/></input> (note: you need to mod wiki in this sub and the import sub.)</p>\
<table><tbody /></table></div>\
\
\
</div>\
<div class="tb-window-footer"><input class="import" type="button" value="import" /></p>\</div>\
<div class="tb-help-config-content">Help for "edit domains"</div>\
</div>\
</div>\
');
        $(html).appendTo('body').show();


        $(html).on('click', '.import', function () {

            $.getJSON('http://www.reddit.com/r/' + $('.importfrom').val() + '/wiki/toolbox.json', function (json) {

                if (json.data.content_md) {
                    var tags = JSON.parse(json.data.content_md).domainTags;
                    if (tags) {
                        config.domainTags = tags;
                        postToWiki('toolbox', config, '.import click', true);
                    }
                    $(html).remove();
                }
            });
        });

        $(html).on('click', '.cancel', function () {
            $(html).remove();
        });
    });

    $body.on('click', '.edit-reasons', function () {

        var html = $('\
<div class="tb-page-overlay edit-reasons-form" comment="the white fade out over the page, we can do without, personally like it">\
<div class="tb-window-wrapper-two" comment="the window itself">\
<div class="tb-window-header" comment="This will contain the name of the window"> Edit reasons <span class="tb-window-header-options"><a class="tb-config-help" href="javascript:;">?</a> - <a class="cancel" href="javascript:;">✕</a></span></div>\
<div class="tb-window-content" comment="This will contain all other elements, this is basically a wrapper to give is more flexibility in the future">\
\
\
<div class="tb-form">\
<p style="text-align:center;"><textarea class="edit-area" style="width: 800px; height: 150px;"></textarea><br/><input type="text" style="width: 150px;" name="flair-text" placeholder="flair text" /> <input type="text" style="width: 150px;" name="flair-css" placeholder="flair css" /><br/><input type="text" name="edit-note" placeholder="reason for edit (optional)" /></p>\
<span class="edit-save-area">\
&nbsp;&nbsp;(click on a reason below to edit it.)</span><br><br>\
<table ><tbody /></table></div>\
\
\
</div>\
<div class="tb-window-footer"><input class="save" type="button" value="new"/> <input class="delete" style="display:none" type="button" value="delete"/></div>\
<div class="tb-help-config-content">\
<h2>Input options:</h2>\
<p>\
<strong>Selection box:</strong><br>\
&lt;select id="contextSelectbox"&gt;<br>\
&lt;option&gt;Option 1&lt;/option&gt;<br>\
&lt;option&gt;Option 2&lt;/option&gt;<br>\
&lt;option&gt;Option 3&lt;/option&gt;<br>\
&lt;/select&gt;<br><br>\
<select id="contextSelectbox">\
<option>Option 1</option>\
<option>Option 2</option>\
<option>Option 3</option>\
</select>\
</p><p>\
<strong>Inputbox:</strong><br>\
&lt;input id="customid"&gt;<br><br>\
<input id="customid"> \
</p><p>\
<strong>Text Area:</strong><br>\
&lt;textarea id="customTextarea" placeholder="Enter Custom reason"&gt;&lt;/textarea&gt;<br><br>\
<textarea id="customTextarea" placeholder="Enter Custom reason"></textarea>\
</p>\
<h2>Valid tokens:</h2>\
<p><strong>{subreddit}</strong> - The subreddit the post/comment was posted to.<br>\
<strong>{author}</strong> - The author of the link/comment<br>\
<strong>{kind}</strong> - The type of post, either \'submission\' or \'comment\'<br>\
<strong>{mod}</strong> - The name of the mod removing the post (you)<br>\
<strong>{title}</strong> - The title of the submission<br>\
<strong>{url}</strong> - url/permalink to the removed post.<br>\
<strong>{domain}</strong> - the domain of the removed submission.<br>\
<strong>{link}</strong> - the link of the removed submission (same as {url} for self-posts)<br>\
<strong>{reason}</strong> - this is the reason something was removed or someone was banned. It should not be used/will not work without &lt;logsub&gt;.<br>\
<strong>{loglink}</strong> -  the link to the removal log thread. It should not be used/will not work without &lt;logsub&gt;. </p>\
</div>\
</div>\
</div>\
');
        $(html).appendTo('body').show();

        // No reasons storred in the config, don't populate list.
        if (config.removalReasons && config.removalReasons.reasons.length > 0) {

            var i = 0;
            $(config.removalReasons.reasons).each(function () {
                var label = unescape(this.text);
                if (label == "") {
                    label = '<span style="color: #cecece">(no reason)</span>';
                } else {
                    if (label.length > 200) {
                        label = label.substring(0, 197) + "...";
                    }
                    label = TBUtils.htmlEncode(label);
                }
                $(html).find('tbody').append('<tr class="removal-reason"><th><input type="radio" style="display:none;" reason="' + i + '"name="reason-' + subreddit + '" id="reason-' + subreddit + '-' + i + '"></th><td><label style="padding: 1em; display: block;" for="reason-' + subreddit + '-' + (i++) + '">' + label + '</label></td></tr>');
            });

            $('th input[type=radio]').change(function () {
                $(html).find('.save').val('save');
                $(html).find('.delete').show();

                var reasonsNum = $(this).attr('reason');
                $('.edit-area').val(unescape(config.removalReasons.reasons[reasonsNum].text));
                $('.edit-area').attr('reason', reasonsNum);
                $('input[name=flair-text]').val(config.removalReasons.reasons[reasonsNum].flairText);
                $('input[name=flair-css]').val(config.removalReasons.reasons[reasonsNum].flairCSS);
            });
        }

        // Do things about stuff.
        $(html).on('click', '.save', function () {
            var reasonsNum = $('.edit-area').attr('reason'),
                reasonText = $('.edit-area').val(),
                reasonFlairText = $("input[name=flair-text]").val(),
                reasonFlairCSS = $("input[name=flair-css]").val(),
                editNote = $("input[name=edit-note]").val()

            if (reasonsNum) {
                // is there's a reasonsNum, it's an existant reason
                if (!editNote) {
                    // default note
                    editNote = 'update';
                }
                editNote += ', reason #'+reasonsNum;
            } else {
                // otherwise, it's a new reason
                editNote = 'create new reason'+(editNote ? ', '+editNote : '');
            }

            if (reasonsNum) {
                // if it's a current reason
                config.removalReasons.reasons[reasonsNum].text = escape(reasonText);
                config.removalReasons.reasons[reasonsNum].flairText = reasonFlairText;
                config.removalReasons.reasons[reasonsNum].flairCSS = reasonFlairCSS;
            } else {
                var reason = {
                    text: escape(reasonText)
                };

                reason.flairText = reasonFlairText;
                reason.flairCSS = reasonFlairCSS;

                if (!config.removalReasons) {
                    config.removalReasons = {
                        reasons: []
                    };
                }

                config.removalReasons.reasons.push(reason);
            }
            postToWiki('toolbox', config, editNote, true);
            if (TBUtils.configCache[subreddit] !== undefined) {
                delete TBUtils.configCache[subreddit]; // should this use TBUtils.clearCache?  I'm not clear on what this does. -al
            }
            $(html).remove();
        });

        // Do things about stuff.
        $(html).on('click', '.delete', function () {
            var reasonsNum = $('.edit-area').attr('reason');

            if (reasonsNum) {
                config.removalReasons.reasons.splice(reasonsNum, 1);
                //config.removalReasons.reasons[reasonsNum].remove();
            } else {
                return;
            }
            postToWiki('toolbox', config, 'delete reason #'+reasonsNum, true);
            if (TBUtils.configCache[subreddit] !== undefined) {
                delete TBUtils.configCache[subreddit]; // should this use TBUtils.clearCache?  I'm not clear on what this does. -al
            }
            $(html).remove();
        });

        $(html).on('click', '.cancel', function () {
            $(html).remove();
        });
    });

    $body.on('click', '.reason-settings', function () {
        var html = '\
<div class="tb-page-overlay reason-setting-form " comment="the white fade out over the page, we can do without, personally like it">\
<div class="tb-window-wrapper-two" comment="the window itself">\
<div class="tb-window-header" comment="This will contain the name of the window"> Reason settings <span class="tb-window-header-options"><a class="tb-config-help" href="javascript:;">?</a> - <a class="cancel" href="javascript:;">✕</a></span></div>\
<div class="tb-window-content" comment="This will contain all other elements, this is basically a wrapper to give is more flexibility in the future">\
\
\
            <div class="tb-form">\
            <table>\
            <tr>\
            <td>\
                get reason from /r/:\
            </td><td>\
                <input class="getfrom" type="text" value="' + (config.removalReasons.getfrom || '') + '"/> (<span style="color:red">WARNING:</span> this setting overrides all other settings.)  &nbsp;\
            </tr><tr>\
            <td>\
                logsub /r/:\
            </td><td>\
                <input class="logsub" type="text" value="' + (config.removalReasons.logsub || '') + '"/>\
            </td>\
            </tr><tr>\
            <td>\
               pmsubject:\
            </td><td>\
               <input class="pmsubject" type="text" value="' + (config.removalReasons.pmsubject || '') + '"/>\
            </td>\
            </tr><tr>\
            <td>\
                logtitle:\
            </td><td>\
                <input class="logtitle" type="text" value="' + (config.removalReasons.logtitle || '') + '"/>\
            </td>\
            </tr><tr>\
            <td>\
                bantitle:\
            </td><td>\
                <input class="bantitle" type="text" value="' + (config.removalReasons.bantitle || '') + '"/>\
            </td>\
            </tr><tr>\
            <td>\
                logreason:\
            </td><td>\
                <input class="logreason" type="text" value="' + (config.removalReasons.logreason || '') + '"/>\
            </td>\
            </tr>\
            </table>\
                <span>Header:</span>\
                <p><textarea class="edit-header" >' + TBUtils.htmlEncode(unescape(config.removalReasons.header || '')) + '</textarea></p>\
                <span>Footer:</span>\
                <p><textarea class="edit-footer" >' + TBUtils.htmlEncode(unescape(config.removalReasons.footer || '')) + '</textarea></p>\
            </div>\
\
\
</div>\
<div class="tb-window-footer"><input class="save" type="button" value="save" /></div>\
<div class="tb-help-config-content">\
        <p><strong>get reason from /r/:</strong> This will load the excisting reasons from an other subreddit. <span style="color:red">WARNING:</span> Will override all settings currently in place<p>\
        <p><strong>logsub /r/:</strong>If this is filled in all removals will be logged to a subreddit specified in this field.<p>\
        <p><strong>pmsubject:</strong> Subject field for the pm that can be send to a user after a removal.<p>\
        <p><strong>logtitle:</strong> Used for a public modlog to define the title of the log post.<p>\
        <p><strong>bantitle:</strong> Same as above but then for bans.<p>\
        <p><strong>logreason:</strong> The standard reason a mod will be presented when logging a removal or ban.<p>\
        <p><strong>Header:</strong> The standard line of text to start each removal post/pm with.<p>\
        <p><strong>Footer:</strong> The standard line of text to end each removal post/pm with.<p>\
        <h2>Valid tokens:</h2>\
        <p><strong>{subreddit}</strong> - The subreddit the post/comment was posted to.<br>\
        <strong>{author}</strong> - The author of the link/comment<br>\
        <strong>{kind}</strong> - The type of post, either \'submission\' or \'comment\'<br>\
        <strong>{mod}</strong> - The name of the mod removing the post (you)<br>\
        <strong>{title}</strong> - The title of the submission<br>\
        <strong>{url}</strong> - url/permalink to the removed post.<br>\
        <strong>{domain}</strong> - the domain of the removed submission.<br>\
        <strong>{link}</strong> - the link of the removed submission (same as {url} for self-posts)<br>\
        <strong>{reason}</strong> - this is the reason something was removed or someone was banned. It should not be used/will not work without &lt;logsub&gt;.<br>\
        <strong>{loglink}</strong> -  the link to the removal log thread. It should not be used/will not work without &lt;logsub&gt;. </p>\
</div>\
</div>\
</div>\
        ';
        $(html).appendTo('body').show();


        $('.reason-setting-form').on('click', '.save', function () {


            config.removalReasons = {
                pmsubject: $('.pmsubject').val(),
                logreason: $('.logreason').val(),
                header: escape($('.edit-header').val()),
                footer: escape($('.edit-footer').val()),
                logsub: $('.logsub').val(),
                logtitle: $('.logtitle').val(),
                bantitle: $('.bantitle').val(),
                getfrom: $('.getfrom').val(),
                reasons: config.removalReasons.reasons || []
            };

            postToWiki('toolbox', config, 'updated removal reason settings', true);

            $('.reason-setting-form').remove();
        });

        $('.reason-setting-form').on('click', '.cancel', function () {
            $('.reason-setting-form').remove();
        });
    });

    $body.on('click', '.tb-config-help', function () {
        var helpwindow = window.open('', '', 'width=500,height=600,location=0,menubar=0,top=100,left=100')
        var htmlcontent = $(this).parents('.tb-window-wrapper-two').find('.tb-help-config-content').html();
        $.log(htmlcontent, true);
        var html = '\
        <!DOCTYPE html>\
        <html>\
        <head>\
        <style>\
        body {\
        font: normal x-small verdana,arial,helvetica,sans-serif;\
        }\
        </style>\
        </head>\
        <body>\
        <div class="help-content">' + htmlcontent + '</div>\
        </body>\
        </html>\
        ';
        helpwindow.document.write(html);
        helpwindow.focus();
    });




    $body.on('click', '.edit-wiki-page', function (e) {
        var page = $(e.target).attr('page'),
            textArea = $body.find('.edit-wikidata'),
            textAreaDiv = $body.find('#edit-wikidata-div'),
            saveButton = $body.find('.save-wiki-data'),
            editArea = $body.find('.wiki-edit-area');

        if (TBUtils.getSetting('syntaxHighlighter', 'enabled', true)) {
            $body.addClass('mod-toolbox-ace');
            $(editArea).show();
            $(textAreaDiv).show();

            var selectedTheme = TBUtils.getSetting('syntaxHighlighter', 'selectedTheme', 'monokai'),
                configEditor = ace.edit('edit-wikidata-div');

            configEditor.setTheme("ace/theme/" + selectedTheme);

            if (page === 'automoderator') {
                configEditor.getSession().setMode("ace/mode/yaml");
            } else {
                configEditor.getSession().setMode("ace/mode/json");
            }

            $(textArea).val('getting wiki data...');
            configEditor.getSession().setValue('getting wiki data...');

            configEditor.getSession().on('change', function () {
                textArea.val(configEditor.getSession().getValue());
            });




            TBUtils.readFromWiki(subreddit, page, false, function (resp) {
                if (resp === TBUtils.WIKI_PAGE_UNKNOWN) {
                    $(textArea).val('error getting wiki data.');
                    configEditor.getSession().setValue('error getting wiki data.');
                    return;
                }

                if (resp === TBUtils.NO_WIKI_PAGE) {
                    $(textArea).val('');
                    configEditor.getSession().setValue('');
                    $(saveButton).show();
                    $(saveButton).attr('page', page);
                    return;
                }

                resp = TBUtils.unescapeJSON(resp);

                // Found it, show it.
                $(textArea).val(resp);
                configEditor.getSession().setValue(resp);
                $(saveButton).show();
                $(saveButton).attr('page', page);
            });
        } else {
            // load the text area, but not the save button.
            $(editArea).show();
            $(textArea).show();
            $(textArea).val('getting wiki data...');

            TBUtils.readFromWiki(subreddit, page, false, function (resp) {
                if (resp === TBUtils.WIKI_PAGE_UNKNOWN) {
                    $(textArea).val('error getting wiki data.');
                    return;
                }

                if (resp === TBUtils.NO_WIKI_PAGE) {
                    $(textArea).val('');
                    $(saveButton).show();
                    $(saveButton).attr('page', page);
                    return;
                }

                resp = TBUtils.unescapeJSON(resp);

                // Found it, show it.
                $(textArea).val(resp);
                $(saveButton).show();
                $(saveButton).attr('page', page);
            });
        }
    });


    $body.on('click', '.save-wiki-data, .cancel-wiki-data', function (e) {
        var button = e.target,
            editArea = $('.wiki-edit-area'),
            page = $(button).attr('page'),
            textArea = $('.edit-wikidata'),
            text = $(textArea).val(),
            editNote = $('input[name=edit-wikidata-note]').val(),
            updateAM = (page === 'automoderator'),
            cancel = (e.target.className == 'cancel-wiki-data')

        if (!editNote) {
            editNote = 'updated '+page+' configuration';
        }

        $(button).removeAttr('page');
        $(textArea).val('');
        $(editArea).hide();

        // not really needed, the cancel button doesn't have a page attrib.
        if (!page || cancel) return;


        // save the data, and blank the text area.
        // also, yes some of the pages are in JSON, but they aren't JSON objects,
        // so they don't need to be re-strinified.
        postToWiki(page, text, editNote, false, updateAM);
    });
}

(function() {
    window.addEventListener("TBUtilsLoaded", function () {
        console.log("got tbutils");
        tbconfig();
    });
})();
