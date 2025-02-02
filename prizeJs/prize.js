
let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
function getFlag(countryCode) {
    const htmllink = ' <img style="vertical-align:middle;display:inline;margin:0px" height=50 \
                       src="https://purecatamphetamine.github.io/country-flag-icons/3x2/' 
        + countryCode + '.svg"/>';
    return htmllink;
}

function populateWithWCIF(compId, targetCountryIso2="") {
    if (!targetCountryIso2) {
        openCategoryName = "";
    }
    var wcifLink =  "https://www.worldcubeassociation.org/api/v0/competitions/" + compId + "/wcif/public"; 
    $.getJSON(wcifLink, function(data) {
        const compName = data.name;
        var eventIdToRounds = new Map();
        const firstSlides = [
            {
                title : [compName],
                contents : [
                    "This competition is brought to you by:<br>" +
                    img('imgs/WCA_logo', 180, ext='.png') + 
                    "<br>This competition is sponsored by:<br>" +
                    // img('imgs/moyu_logo', 150) + "&nbsp &nbsp" +
                    img('imgs/cubewerkz_square', 200)
                ]
            },
        ]
        let logosInOneRow = img('imgs/WCA_logo', 150, ext='.png') + "&nbsp" + 
                             img('imgs/cubewerkz_square', 200);
        if (compSponsor == "Moyu") {
            firstSlides[0].contents = [
                "This competition is brought to you by:<br>" +
                img('imgs/moyu_logo', 150) + "&nbsp &nbsp" + img('imgs/moyu_logo_hm', 140)+
                "<br>" +
                img('imgs/cubewerkz_square', 300) + "&nbsp &nbsp" + img('imgs/WCALogo3D', 230) 
            ]
            logosInOneRow = img('imgs/moyu_logo', 120)
                            + "&nbsp" + img('imgs/moyu_logo_hm', 100)
                            + "&nbsp &nbsp" + img('imgs/cubewerkz_square', 210)
                            + "&nbsp" + img('imgs/WCALogo3D', 160);
        } else if (compSponsor == "Moyu+Mofun") {
            firstSlides[0].contents = [
                "This competition is brought to you by:<br>" +
                img('imgs/WCA_logo', 220, ext='.png')  + "&nbsp &nbsp" + img('imgs/mofunland', 180, ext='.png') +  "<br>" +
                img('imgs/moyu_logo', 180) + "&nbsp &nbsp"  + "&nbsp &nbsp" +  img('imgs/huada', 190, ext='.png')
            ]
            logosInOneRow = img('imgs/WCA_logo', 140, ext='.png') + img('imgs/moyu_logo', 110)
                            + "&nbsp &nbsp" + img('imgs/huada', 125, ext='.png')
                            + "&nbsp &nbsp" + img('imgs/mofunland', 120, ext='.png');
        }
        else if (compSponsor == "ML+DP+GAN") {
            firstSlides[0].contents = [
                "This competition is brought to you by:<br>" +
                img('imgs/WCA_logo', 220, ext='.png')  + "&nbsp &nbsp" + img('imgs/mofunland', 180, ext='.png') +  "<br>" +
                img('imgs/GAN', 180, ext='.png') + "&nbsp &nbsp"  + "&nbsp &nbsp" +  img('imgs/dp_transparent', 150, ext='.png')
            ]
            logosInOneRow = img('imgs/WCA_logo', 140, ext='.png') + img('imgs/mofunland', 120, ext='.png')
                            + "&nbsp &nbsp" + img('imgs/GAN', 120, ext='.png')
                            + "&nbsp &nbsp" + img('imgs/dp_transparent', 100, ext='.png');
        }
                             
        const lastSlides = [];
        if (isChampionship) {
            lastSlides.push(
                {
                    title : [compName],
                    contents : [
                        "Photo for all Singaporean Winners<br>" + logosInOneRow
                    ]
                }
            );

        }
        lastSlides.push(
            {
                title : [compName],
                contents : [
                    "Photo for all Winners<br>" + logosInOneRow
                ]
            }
        );
        lastSlides.push(
            {
                title : [compName, "See you next year!"],
                contents : [
                    logosInOneRow
                ]
            }
        );
    
        events = data.events;
        events.forEach(event => {
            eventIdToRounds[event.id] = event.rounds;
        });
        var slides = [];
    
        var idToPerson = {};
        var targetIds = [];
        data.persons.forEach(person => {
            idToPerson[person.registrantId] = person;
            if (person.countryIso2 === targetCountryIso2) {
                targetIds.push(person.registrantId);
            }
        });
        for (eventId of defaultEventSqeunce) {
            var eventRounds = eventIdToRounds[eventId];
            
            if (eventRounds) {
                const num_rounds = eventRounds.length;
                const lastRound = eventRounds[num_rounds-1];
                const format = formats[lastRound.format];
                
                if (targetCountryIso2) {
                    var slide = {'logos': logosInOneRow};
                    var filteredRes = [];
                    var includedTopPlayers = [];
                    for (var r in lastRound.results) {
                        const res = lastRound.results[r];
                        if (targetIds.includes(res.personId)) {
                            const resTime = res[format.res];
                            if (resTime < 0) {
                                continue;
                            }
                            filteredRes.push(res);
                            includedTopPlayers.push(res.personId);
                        }
                    }
                    filteredRes.sort(function(a,b){return a['ranking'] - b['ranking']});
                    const finalLength = filteredRes.length;
                    
                    if (finalLength < 3 && num_rounds > 1) {
                        var filteredPrevRoundRes = [];
                        const previousRound = eventRounds[num_rounds-2];
                        for (var r in previousRound.results) {
                            const res = previousRound.results[r];
                            if (targetIds.includes(res.personId) && !includedTopPlayers.includes(res.personId)) {
                                filteredPrevRoundRes.push(res);
                            }
                        }
                        filteredPrevRoundRes.sort(function(a,b){return a['ranking'] - b['ranking']});
                        for (var p = 0; p < (3 - finalLength); p++) {
                            filteredRes.push(filteredPrevRoundRes[p]);
                        }
                    }
        
                    slide['title'] = [
                        compName,
                        svg_icon(eventId, 80, commonPath='../event_icons/') + " " + eventNames[eventId],
                        specialCategoryName,
                    ];
                    slide['format'] = format.name;
                    slide['results'] = [];
                    const maxRank = Math.min(3, filteredRes.length);
                    var noRes = false;
                    for (var rank = maxRank; rank >= 1; rank--){
                        const res = filteredRes[rank - 1];
                        if (res == null || res.ranking == null) {
                            slide['results'] = [];
                            slides.push(slide);
                            noRes = true;
                            break;
                        }
                        fillRow(res, rank, format, slide);
                    }
                    if (noRes) {
                        continue;
                    }
                    slides.push(slide);
                }

                var slide = {'logos': logosInOneRow};

                // open category
                slide['title'] = [
                    compName,
                    svg_icon(eventId, 80, commonPath='../event_icons/') + " " + eventNames[eventId],
                    openCategoryName,
                ];
                slide['format'] = format.name;
                slide['results'] = [];
                for (var rank = 3; rank >= 0; rank--){
                    for (var r in lastRound.results) {
                        const res = lastRound.results[r];
                        if (res['ranking'] == rank) {
                            fillRow(res, rank, format, slide);
                        }
                    }
                }
                slides.push(slide);
            }
    
            function fillRow(res, rank, format, slide) {
                const person = idToPerson[res.personId];
    
                const countryCode = person.countryIso2;
                const countryName = regionNames.of(countryCode);
                
                const resTime = res[format.res];
    
                var resText = renderTime(resTime);
                if (eventId === '333mbf') {
                    resText = renderMBTime(resTime);
                }
    
                let tableRow = [rankToAward[rank], person.name, resText];
                if (showCountry) {
                    const countryFlag = getFlag(countryCode);
                    const countryText = countryFlag + ' ' + countryName;
                    tableRow = [rankToAward[rank], countryText, person.name, resText];
                }

                slide['results'].push(tableRow);
            }
        };
        
        renderSlides(firstSlides, slides, lastSlides);
    });
}

populateWithWCIF(compId, targetCountryIso2);

function testSlides() {
    // var compId = "euro2022";
    targetCountryIso2 = "";
    populateWithWCIF(compId, targetCountryIso2);
}

$(function() {
	var interval = 1000;
	window.setInterval(function(){
		$.ajax({
			type: 'get',
			url: 'https://gxqc1gfygd.execute-api.ap-southeast-1.amazonaws.com/production/slides/'+compId+'/get_award_state',
			data: {},
			success: function(data) {
				console.log(data);
                var state = data.state;
				if (state != 'pending') {
					interval = 3000;
					if (state == 'next') {
						Reveal.next();
					} else {
						Reveal.prev();
					}
				} else {
					interval = 1000;
				}
			}
		});
	}, interval);
});
