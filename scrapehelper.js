let fixLocalLinks = ($, url) => {
    var arrElemAttr = [
        {
            'elem': 'img',
            'attr': 'src'
        },
        {
            'elem': 'link',
            'attr': 'href'
        },
        {
            'elem': 'a',
            'attr': 'href'
        },
        {
            'elem': 'script',
            'attr': 'src'
        }
    ]

    prependHostToLocalLinks($, url, arrElemAttr)
}

let prependHostToLocalLinks = ($, url, arrElemAttr) => {
    var attrBeingChanged = null
    for(var i = 0, len = arrElemAttr.length; i < len; i++) {
        $(arrElemAttr[i].elem).each(function () {
            attrBeingChanged = $(this).attr(arrElemAttr[i].attr)
            if(attrBeingChanged && attrBeingChanged.indexOf('://') == -1) {
                var parsedUrl = parseUrl(url)
                var correct_domain = null

                //console.log("Parsed: %j", parsedUrl)

                if(attrBeingChanged.charAt(0) == '/') correct_domain = parsedUrl.domain
                else correct_domain = parsedUrl.domain + '/' + parsedUrl.path
                var new_url = parsedUrl.protocol + '://' + correct_domain + attrBeingChanged
                $(this).attr(arrElemAttr[i].attr, new_url)
            }
        })
    }
}

let parseUrl = (url) => {
    var parsed_url = {}
    if(url == null || url.length == 0)
        return parsed_url

    var protocol_i = url.indexOf('://')
    parsed_url.protocol = url.substr(0,protocol_i)
    if(!parsed_url.protocol) parsed_url.protocol = 'https'

    var remaining_url = url.substr(protocol_i + 3, url.length)
    var domain_i = remaining_url.indexOf('/')
    domain_i = domain_i == -1 ? remaining_url.length : domain_i
    parsed_url.domain = remaining_url.substr(0, domain_i)
    parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length)

    var domain_parts = parsed_url.domain.split('.')
    switch(domain_parts.length) {
        case 2:
            parsed_url.subdomain = null
            parsed_url.host = domain_parts[0]
            parsed_url.tld = domain_parts[1]
            break
        case 3:
            parsed_url.subdomain = domain_parts[0]
            parsed_url.host = domain_parts[1]
            parsed_url.tld = domain_parts[2]
            break
        case 4:
            parsed_url.subdomain = domain.parts[0]
            parsed_url.host = domain_parts[1]
            parsed_url.tld = domain_parts[2] + '.' + domain_parts[3]
            break
    }

    parsed_url.parent_domain = parsed_url.host + '.' + parsed_url.tld
    return parsed_url
}

let addScriptsCss = ($) => {
    $("head").append("<script src='https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>")
    // Resolves jquery.cookie is not a function
    $("head").append("<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js'></script>")
    $("style").append(".hova { background-color: pink;}")
    // Just paste this to jsfiddle to break it out
    $("body").append("<script type='text/javascript'>$('body').children().mouseover(function(e){$('.hova').removeClass('hova');$(e.target).addClass('hova');return false;}).mouseout(function(e){$(this).removeClass('hova');})  .on('click', function(e) {var se = ''; var s = ['id', 'class']; var i = 0; while(!se) {if($(this).attr(s[i])) {se = $(this).get(0).tagName + '.' + $(this).attr(s[i]);  }i++;}window.location.href = window.location.href + '?faq_select=' + se;});</script>")

}

exports.fixLocalLinks = fixLocalLinks
exports.addScriptsCss = addScriptsCss
