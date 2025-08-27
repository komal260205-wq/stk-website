var translations = {"Contents":{},"Menu":{},"Discover":{},"Download":{},"FAQ":{},"Get Involved":{},"Donate":{},"Tools":{},"Language":{},"Management":{},"New page":{},"Edit page":{},"Page history":{},"Visit the main page":{},"Community":{},"Forum":{},"Twitter":{},"Addons":{},"Telegram":{},"Media":{},"YouTube":{},"Gallery":{},"Posters":{},"Development":{},"Modding":{},"GitLab":{},"Documentation":{},"About us":{},"About the team":{},"About SuperTuxKart":{},"Projects using SuperTuxKart":{},"Info":{},"Return to Get Involved":{},"Making Library Nodes":{},"Making Karts":{},"Making Tracks":{},"Code":{},"Prerequisites":{},"You should read the following articles prior to following this tutorial:":{},"Show":{},"Hide":{}};
// ES5 support from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith#polyfill
if (!String.prototype.startsWith)
{
    Object.defineProperty(String.prototype, 'startsWith',
    {
        value: function(search, rawPos)
        {
            var pos = rawPos > 0 ? rawPos|0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}

// var translations will be added by _plugins/translate.rb
var supported_languages = ["en"];
var fallback_languages = [];
var page_translations = {};
var language_names = {"en":"English",};

function getSuitableLang(lang, locale)
{
    var real_locale = locale;
    // Special handling for possible tranditional chinese locales to avoid
    // displaying simplified chinese for those users
    if (lang == 'zh')
    {
        if (locale.search('hk') != -1 || locale.search('mo') != -1)
        {
            real_locale = 'hk';
            locale = 'TW';
        }
        else if (locale.search('tw') != -1 || locale.search('hant') != -1)
        {
            real_locale = 'tw';
            locale = 'TW';
        }
        else
        {
            real_locale = 'cn';
            locale = 'CN';
        }
    }
    sessionStorage.setItem('preferred_locale', real_locale);

    locale = locale.toUpperCase();
    for (var i = 0; i < supported_languages.length; i++)
    {
        var lang_locale = lang + '_' + locale;
        if (supported_languages[i] == lang_locale)
            return supported_languages[i];
    }
    for (var i = 0; i < supported_languages.length; i++)
    {
        var lang_only = supported_languages[i].split('_')[0]
        if (lang_only == lang)
            return supported_languages[i];
    }
    return null;
}

var site_url = 'https://supertuxkart.net' + '' + '/';
var page = window.location.href.substring(site_url.length).split("/").pop();
var page_only = page.split('#')[0];

function getURLLanguage(url)
{
    if (!url.startsWith(site_url))
        return '';
    var sl = url.slice(site_url.length).split('/')[0];
    if (supported_languages.indexOf(sl) != -1)
        return sl;
    return '';
}

function changeLanguage(lang)
{
    var lang_locale = lang.split('-');
    lang = lang_locale[0];
    var locale = '';
    if (lang_locale.length == 2)
        locale = lang_locale[1];
    sessionStorage.setItem('preferred_locale', locale);
    try
    {
        sessionStorage.setItem('overridden_lang', lang);
        if (page_translations.hasOwnProperty(page_only) &&
            page_translations[page_only].indexOf(lang) != -1)
        {
            window.location.replace(site_url + lang + '/' + page_only);
        }
        else
        {
            window.location.replace(site_url + page_only);
        }
    } catch (error) {}
}

var lis = [];
for (cur_lang in language_names)
{
    var new_node = document.getElementById('language-selector-en').cloneNode(true);
    new_node.id = 'language-selector-' + cur_lang;
    var ahref = new_node.getElementsByTagName('A')[0];
    if (cur_lang != 'en' && fallback_languages.indexOf(cur_lang) == -1 &&
        page_translations.hasOwnProperty(page_only) &&
        page_translations[page_only].indexOf(cur_lang) != -1)
    {
        ahref.href = site_url + cur_lang + '/' + page_only;
    }
    else
    {
        ahref.href = 'javascript:changeLanguage("' + cur_lang + '");';
    }
    ahref.textContent = language_names[cur_lang];
    lis.push(new_node);
}

document.getElementById('language-selector').innerHTML = '';
for (var i = 0; i < lis.length; i++)
{
    document.getElementById('language-selector').appendChild(lis[i]);
}

var preferred_lang = document.documentElement.lang.replace("-", "_");
var preferred_locale = '';
var redirect = false;
try
{
    if (!sessionStorage.getItem('first_visit'))
    {
        sessionStorage.setItem('first_visit', true);
        redirect = document.referrer.length == 0 ||
            document.referrer == site_url;
    }

    // Prevent error when cookies disabled
    if (!sessionStorage.getItem('preferred_lang'))
    {
        sessionStorage.setItem('preferred_lang', 'en');

        var user_language = (((navigator.userLanguage || navigator.language).replace('-', '_')).toLowerCase()).split('_');
        var lang = user_language[0];
        var locale = '';
        if (user_language.length > 1)
            locale = user_language[1];
        var suitable_lang = getSuitableLang(lang, locale)
        if (suitable_lang != null)
            sessionStorage.setItem('preferred_lang', suitable_lang);
    }
    if (sessionStorage.getItem('preferred_locale'))
        preferred_locale = sessionStorage.getItem('preferred_locale');

    if (sessionStorage.getItem('overridden_lang'))
    {
        preferred_lang = sessionStorage.getItem('overridden_lang');
        sessionStorage.setItem('preferred_lang', preferred_lang);
        sessionStorage.removeItem('overridden_lang');
    }
    else
    {
        // Override preferred language if language tag is supplied in url
        // or the referrer
        var site_url_lang = getURLLanguage(window.location.href);
        if (site_url_lang == '')
            site_url_lang = getURLLanguage(document.referrer);
        if (site_url_lang != '')
            sessionStorage.setItem('preferred_lang', site_url_lang);
        preferred_lang = sessionStorage.getItem('preferred_lang');
    }
} catch (error) {}

var doc_lang = document.documentElement.lang.replace("-", "_");
if (doc_lang == 'en' && doc_lang != preferred_lang)
{
    // Only redirect if page translation exists and first time visit the page
    // without referrer (so search engine clicking is not affected),
    // otherwise translate the layout texts and links
    var success = false;
    if (redirect && page_translations.hasOwnProperty(page))
    {
        var arr = page_translations[page];
        for (var i = 0; i < arr.length; i++)
        {
            if (preferred_lang == arr[i])
            {
                window.location.replace(site_url + preferred_lang + '/' + page);
                success = true;
                break;
            }
        }
    }
    if (!success && doc_lang == 'en')
    {
        // Special locale handling in the end
        doc_lang = preferred_lang;
        var logo = document.getElementsByClassName('logo noselect')[0];
        var logo_text = logo.getAttribute('title');
        if (translations.hasOwnProperty(logo_text) &&
            translations[logo_text].hasOwnProperty(preferred_lang))
            logo.setAttribute('title', translations[logo_text][preferred_lang]);

        // Table of contents markdown toggle [Show] / [Hide] handling
        var markdown_toggle = document.getElementById('markdown-toggle');
        if (markdown_toggle != null)
        {
            var show_text = markdown_toggle.getAttribute('data-show-text');
            if (translations.hasOwnProperty(show_text) &&
                translations[show_text].hasOwnProperty(preferred_lang))
                markdown_toggle.setAttribute('data-show-text', translations[show_text][preferred_lang]);
            var hide_text = markdown_toggle.getAttribute('data-hide-text');
            if (translations.hasOwnProperty(hide_text) &&
                translations[hide_text].hasOwnProperty(preferred_lang))
                markdown_toggle.setAttribute('data-hide-text', translations[hide_text][preferred_lang]);
        }

        var elements = document.getElementsByClassName("translate");
        for (var i = 0; i < elements.length; i++)
        {
            var element_text = elements[i].textContent;
            if (translations.hasOwnProperty(element_text) &&
                translations[element_text].hasOwnProperty(preferred_lang))
                elements[i].textContent = translations[element_text][preferred_lang];
        }
        var links = document.links;
        for (var i = 0; i < links.length; i++)
        {
            if (!links[i].href.startsWith(site_url))
                continue;
            var link_page = links[i].href.split("/").pop();
            if (!page_translations.hasOwnProperty(link_page))
                continue;
            var arr = page_translations[link_page];
            for (var j = 0; j < arr.length; j++)
            {
                if (preferred_lang == arr[j])
                {
                    links[i].href = site_url + preferred_lang + '/' + link_page;
                    break;
                }
            }
        }
    }
}

var locale_key = preferred_lang + '-' + preferred_locale;
var locale_dict = {"zh_TW-hk":{"部落格":"網誌"},"fr-ca":{"football":"soccer","Football":"Soccer"}};
if (doc_lang == preferred_lang && locale_dict.hasOwnProperty(locale_key))
{
    var walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        function acceptNode(node)
        {
            return NodeFilter.FILTER_ACCEPT;
        },
        false);
    var n;
    while (n = walker.nextNode())
    {
        if (n.textContent.trim().length == 0)
            continue;
        var locale_data = locale_dict[locale_key];
        for (key in locale_data)
        {
            n.textContent = n.textContent.replace(key, locale_data[key]);
        }
    }
}
