

let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
function getFlag(countryCode) {
    const htmllink = ' <img style="vertical-align:middle;display:inline;margin:0px" height=50 \
                       src="https://purecatamphetamine.github.io/country-flag-icons/3x2/' 
        + countryCode + '.svg"/>';
    return htmllink;
}
const waitingAreaInstr = "Competitors should return to the waiting area after every attempt.";
const stayAtSolvingStation = "Competitors in this group should stay at the solving station.";

function populateWithWCIF(compId, targetCountryIso2="", venue_idx=0, roomIdx=0) {
    if (!targetCountryIso2) {
        openCategoryName = "";
    }
    var wcifLink =  "https://www.worldcubeassociation.org/api/v0/competitions/" + compId + "/wcif/public";
    // wcifLink = 'MYHMSingaporeChampionship2024.json'

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
        let logosInOneRow = genLogos(firstSlides);

        var schedule = data.schedule
        var venue = schedule.venues[venue_idx];
        var room = venue.rooms[roomIdx];
        var acts = room.activities;
        // sort activities by start time
        acts.sort(function(a,b){
            return  a.startTime.localeCompare(b.startTime) ;
        });

        var slides = [];

        flattened_acts = [];
        for (var act of acts) {
            var childActs = act.childActivities;
            if (childActs.length > 0) {
                for (var j=0; j<childActs.length; j++) {
                    flattened_acts.push(childActs[j]);
                }
            } else {
                flattened_acts.push(act);
            }
        }

        var finalRounds = [];
        for (var eventData of data.events) {
            var finalRound = eventData.rounds[eventData.rounds.length-1];
            finalRounds.push(finalRound.id);

            for (var round of eventData.rounds) {
                eventIdToRounds.set(round.id, round);
            }
        }

        for (var i=0; i<flattened_acts.length-1; i++) {
            var act = flattened_acts[i];
            // if (act.activityCode == 'other-checkin') {
            //     continue;
            // }
            var nextAct = flattened_acts[i+1];

            var isCurrentCompeting = (!act.activityCode.includes('other'));
            var isNextCompeting = (!nextAct.activityCode.includes('other'));
            var currentEvent = '';
            if (isCurrentCompeting) {
                currentEvent = act.activityCode.split('-')[0];
            }
            var currentInstr = waitingAreaInstr;
            var nextInstr = ["Please remain in the venue and get ready for the next group."];
            var doubleSlides = true;
            var nextInstr1 = ["Please submit your puzzle at the submission table before the next group starts.",
                            "Please proceeed to the waiting area after submitting the puzzle."];

            const currentRound = act.activityCode.split('-').slice(0, 2).join("-");
            const nextRound = nextAct.activityCode.split('-').slice(0, 2).join("-");
            if (finalRounds.includes(currentRound)) {
                currentInstr = stayAtSolvingStation;
                if ( finalRounds.includes(nextRound)) {
                    nextInstr = ["Please submit your puzzle at the submission table before the next group starts.",
                    "Please proceed to the waiting area after submitting your puzzle."];
                }
                if (nextRound == "333-r4") {
                    nextInstr = ["Please proceed to the waiting area, do not need to submit the puzzle"];
                }
                doubleSlides = false;
            }

            const currentRoundData = eventIdToRounds.get(currentRound);
            var currentAct = act.name;

            var onlyOneGroup = false;
            if (currentRoundData) {
                var cutoff = null;
                if (currentRoundData.cutoff) {
                    cutoff = currentRoundData.cutoff.attemptResult;
                }
    
                var timeLimit = null;
                var cumulativeTimeLimit = false;
                if (currentRoundData.timeLimit) {
                    if (currentRoundData.timeLimit.cumulativeRoundIds.length > 0) {
                        cumulativeTimeLimit = true;
                        timeLimit = currentRoundData.timeLimit.centiseconds;
                    } else if (currentRoundData.timeLimit.centiseconds != 60000) {
                        timeLimit = currentRoundData.timeLimit.centiseconds;
                    }
                }
                // remove group number if there is only one group
                if (currentRoundData.extensions) {
                    for (var ext of currentRoundData.extensions) {
                        if (ext.id == "num_competitors_per_group") {
                            var numCompetitorsPerGroup = ext.data.num_competitors_per_group;
                            if (numCompetitorsPerGroup.length == 1) {
                                currentAct = currentAct.replace(", Group 1", "");
                                onlyOneGroup = true;
                            }
                        }
                    }
                }
            }

            if (act.extensions && isCurrentCompeting && !onlyOneGroup && !act.activityCode.includes("r1")) {
                // extract round name, without group number
                var groupName = act.name.split("Group")[0];
                var groupNum = act.name.split("Group ")[1];
                for (var ext of act.extensions) {
                    if (ext.id == "actLinks") {
                        var groupInfo = ""
                        if (ext.data.is_by_ranking) {
                            groupInfo = "Seed " + ext.data.seed_start + " ~ " + ext.data.seed_end;
                        } else {
                            if (groupNum == "1") {
                                groupInfo = "Even Seeds";
                            } else if (groupNum == "2") {
                                groupInfo = "Odd Seeds";
                            }
                        }
                        if (ext.data.num_competitors <= numStations) {
                            currentInstr = stayAtSolvingStation;
                        }
                    }
                }
                currentAct = groupName + groupInfo;
            }

            var nextActName = nextAct.name;
            if (nextAct.startTime.slice(0, 10) != act.startTime.slice(0, 10)) {
                isNextCompeting = false;
                nextActName = "End of Day";
            }

            if (act.activityCode == "333-r4-g1") {
                currentInstr = "Please keep silent during the attempts. <br> No flash photography!";
                nextActName = ""
            }

            var slide = {
                "currentAct": currentAct,
                "currentInstr": currentInstr,
                "isCurrentCompeting": isCurrentCompeting,
                "currentEvent": currentEvent,
                "cutoff": cutoff,
                "timeLimit": timeLimit,
                "cumulativeTimeLimit": cumulativeTimeLimit,
                "nextAct": nextActName,
                "nextInstr": nextInstr,
                "isNextCompeting": isNextCompeting
            }
            slides.push(slide);

            if (doubleSlides) {
                var slide = {
                    "currentAct": currentAct,
                    "currentInstr": currentInstr,
                    "isCurrentCompeting": isCurrentCompeting,
                    "currentEvent": currentEvent,
                    "cutoff": cutoff,
                    "timeLimit": timeLimit,
                    "cumulativeTimeLimit": cumulativeTimeLimit,
                    "nextAct": nextActName,
                    "nextInstr": nextInstr1,
                    "isNextCompeting": isNextCompeting
                }
                slides.push(slide);
            }
        }
        const lastSlides = [];

        renderProgSlides(compName, firstSlides, slides, lastSlides, logosInOneRow);
    });
}


function centisecondsToTimeStr(centiseconds) {
    var seconds = centiseconds / 100;
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    if (minutes == 0) {
        return seconds.toFixed(0) + ' sec ';
    }
    if (seconds == 0) {
        return minutes + ' min ';
    }
    return minutes + " min " + seconds.toFixed(0) + ' sec ';
}

function renderProgSlides(compName, firstSlides, actSlides, lastSlides, logosInOneRow) {
    var HTML = '';
    HTML += renderNonAwardSlides(firstSlides);

    for (var s in actSlides) {
        slide = actSlides[s];
        var slideHTML = "";
        var eventId = slide.currentEvent;
        var titleText = compName;
        if (eventId) {
            titleText += " " + svg_icon(eventId, 100, commonPath='event_icons/');
        }
        slideHTML += title(titleText);
        var contents = '<div>'
        contents += title("Current: " + slide.currentAct);
        if (slide.isCurrentCompeting) {
            contents += p_noAct(htmlElement('b', slide.currentInstr));
        }
        if (slide.cutoff) {
            contents += p_noAct(htmlElement('b', "Cutoff time:  < " + centisecondsToTimeStr(slide.cutoff)));
        }
        if (slide.timeLimit) {
            var limitText = "Time limit:  < ";
            if (slide.cumulativeTimeLimit) {
                limitText = "Cumulative time limit: < ";
            }
            contents += p_noAct(limitText + centisecondsToTimeStr(slide.timeLimit));
        }

        contents += logosInOneRow + '</div>';
        slideHTML += contents;

        var nextContents = '<div style=\"text-align:center\">'
        if (slide.isNextCompeting) {
            nextContents += p_noAct("For competitors in the next group (" + slide.nextAct + "):");
            nextContents += unorderdList(slide.nextInstr, className=null);
        } else {
            if (slide.nextAct) {
                nextContents = '<div>' + title("Next: " + slide.nextAct);
            }
        }
        nextContents += '</div>';
        slideHTML += nextContents;
        HTML += sec(slideHTML);
    }
    HTML += renderNonAwardSlides(lastSlides);

    $("#slides").html(HTML);
}


populateWithWCIF(compId, targetCountryIso2, venue_idx=venue_idx);

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
			url: 'https://gxqc1gfygd.execute-api.ap-southeast-1.amazonaws.com/production/slides/'+compId+'/get_prog_state',
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
