var formats = {
    1: {
        name: "Best of 1",
        attempts: 1,
        res: 'best'
    },
    2: {
        name: "Best of 2",
        attempts: 2,
        res: 'best'
    },
    3: {
        name: "Best of 3",
        attempts: 3,
        res: 'best'
    },
    5: {
        name: "Best of 5",
        attempts: 5,
        res: 'best'
    },
    a: {
        name: "Average of 5",
        attempts: 5,
        res: 'average'
    },
    m: {
        name: "Mean of 3",
        attempts: 3,
        res: 'average'
    }
};

const defaultEventSqeunce = [
    '555bf', '333mbf', '444bf',
    '333fm', '333bf', '777', '666', 'sq1', 
    'minx', '555',
    'clock',
    'skewb', '333oh', 'pyram', '444', '222',
    '333',
]

var eventNames = {
    '333' : "3×3×3 Cube",
    '222' : '2×2×2 Cube',
    '444' : '4×4×4 Cube',
    '555' : '5×5×5 Cube',
    '666' : '6×6×6 Cube',
    '777' : '7×7×7 Cube',
    '333bf' : '3×3×3 Blindfolded',
    '333oh' : '3×3×3 One-Handed',
    '333ft' : '3×3×3 With Feet',
    'minx' : 'Megaminx',
    'pyram' : 'Pyraminx',
    'skewb' : 'Skewb',
    'clock' : 'Clock',
    'sq1' : 'Square-1',
    '444bf' : '4×4×4 Blindfolded',
    '555bf' : '5×5×5 Blindfolded',
    '333mbf' : '3×3×3 Multi-Blind', // special scoresheet for this
    '333fm' : '3×3×3 Fewest Moves' // no need to generate scoresheet for this
};

const rankToAward = {
    3: "2nd Runner-up",
    2: "1st Runner-up",
    1: "Champion",
}

let showCountry = false;
let formatIndex = 2;
var resultsHeader = ["Place", "Name", "Format"];

function renderSlides(firstSlides, awardSlides, lastSlides, allRounderSlides=null) {
    var HTML = '';
    HTML += renderNonAwardSlides(firstSlides);

    for (var s in allRounderSlides) {
        var slide = allRounderSlides[s];
        var slideHTML = "";
        var titles = slide.title;
        for (var t in titles) {
            slideHTML += title(titles[t]);
        }
        slideHTML += renderResults(slide.results, slide.format);
        if (slide.logos) {
            slideHTML += slide.logos;
        }
        HTML += sec(slideHTML);
    }

    for (var s in awardSlides) {
        var slide = awardSlides[s];
        var slideHTML = "";
        var titles = slide.title;
        for (var t in titles) {
            slideHTML += title(titles[t]);
        }
        slideHTML += renderResults(slide.results, slide.format);
        if (slide.logos) {
            slideHTML += slide.logos;
        }
        HTML += sec(slideHTML);
    }
    HTML += renderNonAwardSlides(lastSlides);

    $("#slides").html(HTML);
    // auto load first page:
    Reveal.next(); Reveal.prev();
}

function renderNonAwardSlides(slides) {
	var HTML = '';
	for (var s in slides) {
		var slide = slides[s];
		var slideHTML = "";
		var titles = slide.title;
		for (var t in titles) {
			slideHTML += title(titles[t]);
		}
		slideHTML += renderContents(slide.contents);
		HTML += sec(slideHTML);
	}
    return HTML;
}


function renderFirstSlides(slides) {
    var htmlText = '';
    

    return htmlText
}

function renderLastSlides(slides) {
    var htmlText = '';
    return htmlText
}

function renderResults(results, format, logos=null) {
    var slideHTML = "";
    resultsHeader[formatIndex] = format;
    const headerRow = tableElements(resultsHeader);
    var tableHead = htmlElement('tr', headerRow);
    tableHead = htmlElement('thead', headerRow);
    slideHTML += tableHead;

    var tableBody = '';
    for (var r in results) {
        const tableRow = tableElements(results[r]);
        tableBody += htmlElement('tr', tableRow, 'fragment');
    }
    tableBody = htmlElement('tbody', tableBody);
    
    slideHTML = htmlElement('table', slideHTML+tableBody);

    return slideHTML;
}

function htmlElement(tag, content, className) {
    var html = "<" + tag;
    if (className) {
        html += " class='" + className + "'";
    }
    html += '>' + content + "</" + tag + '>';
    return html
}

function sec(content) {
    return htmlElement("section", content);
}

function tableElements(elements) {
    var html = "";
    for (var e in elements) {
        html += '<td>' + elements[e] + '</td>';
    }
    return html;
}

function renderContents(contents) {
    var slideHTML = "";
    for (var c in contents) {
        if (c == 0) {
            slideHTML += htmlElement('p', contents[c]);
        } else {
            slideHTML += p(contents[c]);
        }
    }
    return slideHTML;
}

function p(content) {
    return htmlElement("p", content, "fragment");
}

function p_noAct(content) {
    return htmlElement("p", content);
}

function title(content) {
    return htmlElement("h3", content, "title");
}

function img(name, height=0, ext='.jpg') {
    if (height > 0) {
        return "<img src='"  + name + ext + "' height=" + height + " style=\"vertical-align:middle\">"
    }
    return "<img src='" + name + ext + "'>"
}

function svg_icon(name, height=0, commonPath='event_icons/') {
    if (height > 0) {
        return "<img src='" + commonPath + name + ".svg' height=" + height + " style=\"vertical-align:middle\">"
    }
    return "<img src='" + commonPath + name + ".svg'>"
}

function a(content, address) {
    return "<a href='" + address +"' target='_blank'>" + content + "</a>";
}

function small(content) {
    return htmlElement('span', content, 'small');
}

function unorderdList(items, className="fragment small") {
    var html = '';
    for (var i in items) {
        html += htmlElement("li", items[i], className);
    }
    return htmlElement("ul", html);
}

function keyword(word) {
    return htmlElement("b", word, "keyword");
}

function renderTime(time, precision=2) {
    var text;
    if (time) {
        if (time < 6000) {
            text = (time/100).toFixed(precision);
            
        } else {
            var minute = ~~(time / 6000);
            var seconds = (time % 6000) / 100;
            var secondsText = seconds.toFixed(precision);

            if (secondsText.length < 5) {
                secondsText = '0' + secondsText;
            }
            text = minute + ':' + secondsText;
        }
    } else {
            text = '-';
    }
    return text;
}

function renderMBTime(time) {
    const missed = time % 100;
    const DDTTTTT = Math.floor(time/100);
    const DD = Math.floor(DDTTTTT/100000);
    const TTTTT = DDTTTTT % 100000;

    const minute = ~~(TTTTT / 60);
    var secondsText = (TTTTT % 60);
    if (secondsText < 10) {
        secondsText = '0' + secondsText;
    }

    const timeText = minute + ':' + secondsText;
    const difference = 99 - DD;
    const solved = difference + missed;
    const attempted = solved + missed;
    return solved + '/' + attempted + ' ' + timeText;
}

var venue_idx = 0;

function genLogos(firstSlides) {
    let logosInOneRow = img('imgs/WCA_logo', 150, ext = '.png') + "&nbsp" +
        img('imgs/cubewerkz_square', 200);
    if (compSponsor == "Moyu") {
        firstSlides[0].contents = [
            "This competition is brought to you by:<br>" +
            img('imgs/moyu_logo', 150) + "&nbsp &nbsp" + img('imgs/moyu_logo_hm', 140) +
            "<br>" +
            img('imgs/cubewerkz_square', 300) + "&nbsp &nbsp" + img('imgs/WCALogo3D', 230)
        ];
        logosInOneRow = img('imgs/moyu_logo', 120)
            + "&nbsp" + img('imgs/moyu_logo_hm', 100)
            + "&nbsp &nbsp" + img('imgs/cubewerkz_square', 210)
            + "&nbsp" + img('imgs/WCALogo3D', 160);
    } else if (compSponsor == "Moyu+Mofun") {
        firstSlides[0].contents = [
            "This competition is brought to you by:<br>" +
            img('imgs/WCA_logo', 220, ext = '.png') + "&nbsp &nbsp" + img('imgs/mofunland', 180, ext = '.png') + "<br>" +
            img('imgs/moyu_logo', 180) + "&nbsp &nbsp" + "&nbsp &nbsp" + img('imgs/huada', 190, ext = '.png')
        ];
        logosInOneRow = img('imgs/WCA_logo', 140, ext = '.png') + img('imgs/moyu_logo', 110)
            + "&nbsp &nbsp" + img('imgs/huada', 125, ext = '.png')
            + "&nbsp &nbsp" + img('imgs/mofunland', 120, ext = '.png');
    } else if (compSponsor == "NUS+Mofun") {
        firstSlides[0].contents = [
            "This competition is brought to you by:<br>" +
            img('imgs/WCA_logo', 220, ext = '.png') + "&nbsp &nbsp" + img('imgs/mofunland', 180, ext = '.png') + "<br>" +
            img('imgs/nus_cube', 200, ext = '.jpg') + "&nbsp &nbsp" + "&nbsp &nbsp &nbsp" +
            img('imgs/nus_mathsoc', 170, ext = '.jpg')
        ];
        logosInOneRow = img('imgs/WCA_logo', 140, ext = '.png') + img('imgs/mofunland', 120, ext = '.png')
            + "&nbsp &nbsp" + img('imgs/nus_cube', 130, ext = '.jpg')
            + "&nbsp &nbsp" + img('imgs/nus_mathsoc', 110, ext = '.jpg');
    }
    else if (compSponsor == "ML+DP+GAN") {
        firstSlides[0].contents = [
            "This competition is brought to you by:<br>" +
            img('imgs/WCA_logo', 220, ext = '.png') + "&nbsp &nbsp" + img('imgs/mofunland', 180, ext = '.png') + "<br>" +
            img('imgs/GAN', 180, ext = '.png') + "&nbsp &nbsp" + "&nbsp &nbsp" + img('imgs/dp_transparent', 150, ext = '.png')
        ];
        logosInOneRow = img('imgs/WCA_logo', 140, ext = '.png') + img('imgs/mofunland', 120, ext = '.png')
            + "&nbsp &nbsp" + img('imgs/GAN', 120, ext = '.png')
            + "&nbsp &nbsp" + img('imgs/dp_transparent', 100, ext = '.png');
    }
    return logosInOneRow;
}
