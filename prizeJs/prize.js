const compId = 'SingaporeChampionship2023';
let targetCountryIso2 = "SG";
const specialCategoryName = "Singaporean Category";
const openCategoryName = "Open Category";

var wcifLink =  "https://www.worldcubeassociation.org/api/v0/competitions/" + compId + "/wcif/public"; 

// for testing
wcifLink = 'euro2022.json';
targetCountryIso2 = "DK";

var eventIdToRounds = new Map();
let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
function getFlag(countryCode) {
    const htmllink = ' <img style="vertical-align:middle;display:inline;margin:0px" height=50 \
                       src="https://purecatamphetamine.github.io/country-flag-icons/3x2/' 
        + countryCode + '.svg"/>';
    return htmllink;
}


$.getJSON(wcifLink, function(data) {
    const compName = data.name;

    const firstSlides = [
        {
            title : [compName],
            contents : [
                "This competition is brought to you by:<br>" +
                img('imgs/nus_mathsoc', 180) + "&nbsp &nbsp" +  img('imgs/WCALogo3D', 180) + 
                "<br>This competition is sponsored by:<br>" +
                img('imgs/moyu_logo', 150) + "&nbsp &nbsp" +  img('imgs/cubewerkz_square', 200)
                
            ]
        },
    ]

    const logosInOneRow = img('imgs/nus_mathsoc', 120) + "&nbsp" +  img('imgs/WCALogo3D', 120) + "&nbsp" + 
                        img('imgs/moyu_logo', 120) + "&nbsp" +  img('imgs/cubewerkz_square', 160);
    const lastSlides = [
        {
            title : [compName],
            contents : [
                "Photo for all Singaporean Winners<br>" + logosInOneRow
            ]
        },
        {
            title : [compName],
            contents : [
                "Photo for all Winners<br>" + logosInOneRow
            ]
        },
        {
            title : [compName, "See you next year!"],
            contents : [
                logosInOneRow
            ]
        },
    ]

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

    defaultEventSqeunce.forEach(eventId => {
        var eventRounds = eventIdToRounds[eventId];
        
        if (eventRounds) {
            num_rounds = eventRounds.length;
            const lastRound = eventRounds[num_rounds-1];
            const format = formats[lastRound.format];
            var slide = {};
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
                eventNames[eventId],
                specialCategoryName,
            ];
            slide['format'] = format.name;
            slide['results'] = [];
            const maxRank = Math.min(3, filteredRes.length);
            for (var rank = maxRank; rank >= 1; rank--){
                const res = filteredRes[rank - 1];
                fillRow(res, rank, format, slide);
            }
            slides.push(slide);

            var slide = {};
            // open category
            slide['title'] = [
                compName,
                eventNames[eventId],
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
            const countryFlag = getFlag(countryCode);
            const countryText = countryFlag + ' ' + countryName;

            const resTime = res[format.res];

            var resText = renderTime(resTime);
            if (eventId === '333mbf') {
                resText = renderMBTime(resTime);
            }

            slide['results'].push([
                rankToAward[rank], countryText, person.name, resText
            ]);
        }
    });
    
    renderSlides(firstSlides, slides, lastSlides);
});


