let testingWith23 = true;
testingWith23 = false;
let compId = 'CoolDownSingapore2024';
let compSponsor = "Moyu+Mofun";
if (testingWith23) {
    compId = "NTUWelcome2023";
}

let targetCountryIso2 = null;

console.log('compId:' + compId);

const specialCategoryName = "Singaporean Category";
let openCategoryName = "Open Category";
let isChampionship = false;

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
