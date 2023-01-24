const compId = 'Euro2022';
const compName = "Singapore Championship 2023"
const countryIso2 = "MY";

const defaultEventSqeunce = [
    '555bf', '444bf', '333mbf',
    '333fm', '777', '666', '333bf', 'clock', 'sq1',
    'minx', '555',
    'skewb', '333oh', '444', 'pyram', '222',
    '333',
]


wcifLink =  "https://www.worldcubeassociation.org/api/v0/competitions/" + compId + "/wcif/public"; 
wcifLink = 'mcc2022.json';

var eventIdToRounds = new Map();
let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
function getFlag(countryCode) {
    const htmllink = ' <img style="vertical-align:middle;display:inline;" height=40 src="https://purecatamphetamine.github.io/country-flag-icons/3x2/' 
        + countryCode + '.svg"/>';
    return htmllink;
}

$.getJSON(wcifLink, function(data) {
    events = data.events;
    events.forEach(event => {
        eventIdToRounds[event.id] = event.rounds;
    });
    var slides = [];

    idToPerson = {};
    data.persons.forEach(person => {
        idToPerson[person.registrantId] = person;
    });

    defaultEventSqeunce.forEach(eventId => {
        var eventRounds = eventIdToRounds[eventId];
        var slide = {};
        if (eventRounds) {
            num_rounds = eventRounds.length;
            const lastRound = eventRounds[num_rounds-1];
            slide['title'] = [
                compName,
                eventNames[eventId],
                "Open Category"
            ];
            const format = formats[lastRound.format]
            slide['format'] = format.name;
            slide['results'] = [];
            for (var rank = 3; rank >= 0; rank--){
                for (var r in lastRound.results) {
                    const res = lastRound.results[r];
                    if (res['ranking'] == rank) {
                        const person = idToPerson[res.personId];
                        const countryCode = person.countryIso2;
                        const countryName = regionNames.of(countryCode);
                        const countryFlag = getFlag(countryCode);
                        const resTime = res[format.res];
                        
                        var resText = renderTime(resTime);
                        if (eventId === '333mbf') {
                            resText = renderMBTime(resTime);
                        }
                        slide['results'].push([
                            rankToAward[rank],  countryFlag + ' ' + countryName,
                            person.name, resText
                        ]);
                    }
                }
            }
            slides.push(slide);
        }
    });
    
    renderSlides(slides);
});


