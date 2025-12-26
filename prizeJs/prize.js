
let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
function getFlag(countryCode) {
    const htmllink = ' <img style="vertical-align:middle;display:inline;margin:0px" height=50 \
                       src="https://purecatamphetamine.github.io/country-flag-icons/3x2/' 
        + countryCode + '.svg"/>';
    return htmllink;
}

async function get_top10_from_csv(csv_url, readCountry=false) {
    var top_10 = [];
    if (typeof csv_url === 'string' && csv_url.startsWith('s3://')) {
        var s3Path = csv_url.slice('s3://'.length);
        var slashIndex = s3Path.indexOf('/');
        var bucket = s3Path;
        var key = '';
        if (slashIndex !== -1) {
            bucket = s3Path.slice(0, slashIndex);
            key = s3Path.slice(slashIndex + 1);
        }
        csv_url = 'https://' + bucket + '.s3.amazonaws.com/' + key;
    }
    try {
        const res = await fetch(csv_url, { method: "GET", mode: "cors" });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.text();
        var allRows = data.split(/\r?\n|\r/);
        for (var i = 1; i < Math.min(11, allRows.length); i++) {
            var rowCells = allRows[i].split(',');
            if (rowCells.length < 3) {
                continue;
            }
            var personName = rowCells[2];
            if (readCountry) {
                var country = rowCells[3];
                var totalPoints = rowCells[4];
                top_10.push([i, personName, totalPoints, country]);
            } else {
                var totalPoints = rowCells[3];
                top_10.push([i, personName, totalPoints]);
            }
        }
        console.log(top_10);
    } catch (err) {
        console.error('Failed to load CSV:', csv_url, err);
    }
    return top_10;
}

function populateWithWCIF(compId, targetCountryIso2="") {
    if (!targetCountryIso2) {
        openCategoryName = "";
    }
    var wcifLink =  "https://www.worldcubeassociation.org/api/v0/competitions/" + compId + "/wcif/public"; 
    $.getJSON(wcifLink, async function(data) {
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
        let logosInOneRow = genLogos(firstSlides);
                             
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
        var all_rounder_slides = [];
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
                        svg_icon(eventId, 80, commonPath='event_icons/') + " " + eventNames[eventId],
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
                    svg_icon(eventId, 80, commonPath='event_icons/') + " " + eventNames[eventId],
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
                var personName = person.name;
    
                var resText = renderTime(resTime);
                if (eventId === '333mbf') {
                    resText = renderMBTime(resTime);
                }
    
                if (showCountry) {
                    const countryFlag = getFlag(countryCode);
                    personName = countryFlag + ' ' + personName;
                }
                const tableRow = [rankToAward[rank], personName, resText];
                slide['results'].push(tableRow);
            }
        };
        
        if (isChampionship) {
            const root_url = 'https://reg-production.s3.ap-southeast-1.amazonaws.com/stats/';
            // const root_url = '../stats/';
            const sg_cat_url = root_url + compId + '/sg_cat_live.csv';
            const open_cat_url = root_url + compId + '/open_cat_live.csv';

            const sg_cat_top_10 = await get_top10_from_csv(sg_cat_url);
            const open_cat_top_10 = await get_top10_from_csv(open_cat_url, readCountry=true);

            var casResults = [
                {
                    'categoryName': specialCategoryName,
                    'top_10': sg_cat_top_10,
                },
                {
                    'categoryName': openCategoryName,
                    'top_10': open_cat_top_10
                }
            ];

            for (var c in casResults) {
                const categoryName = casResults[c].categoryName;
                const top_10 = casResults[c].top_10;

                var baseSlide = {'logos': logosInOneRow};
                baseSlide['title'] = [
                    compName,
                    "All Rounder",
                    categoryName,
                ];
                baseSlide['format'] = "CAS";
                baseSlide['results'] = [];
                // ranking 10 to 6 in one slide, then 5 to 1 in another slidd

                var slide1 = JSON.parse(JSON.stringify(baseSlide));
                var slide2 = JSON.parse(JSON.stringify(baseSlide));
                for (var r = 10; r > 0; r--) {
                    const i = r - 1;
                    const row = top_10[i];
                    const rank = row[0];
                    var personName = row[1];
                    const totalPoints = row[2];
                    if (showCountry && categoryName === openCategoryName) {
                        const countryCode = row[3];
                        const countryFlag = getFlag(countryCode);
                        personName = countryFlag + ' ' + personName;
                    }
                    var tableRow = [rank, personName, totalPoints];
                    if (rank >= 6) {
                        slide1['results'].push(tableRow);
                    } else {
                        slide2['results'].push(tableRow);
                    }
                }
                all_rounder_slides.push(slide1);
                all_rounder_slides.push(slide2);
            }
        }
        renderSlides(firstSlides, slides, lastSlides, all_rounder_slides);
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
