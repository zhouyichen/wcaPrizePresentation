let compId = '';
let targetCountryIso2 = "";
let compSponsor = "";
window.location.search.substring(1).split("&").forEach(function(item) {
    if (item.split("=")[0] === 'compId') {
        compId = item.split("=")[1];
    }
    if (item.split("=")[0] === 'sponsor') {
        compSponsor = item.split("=")[1];
    }
});
console.log('compId:' + compId);
console.log('compSponsor:' + compSponsor);

const specialCategoryName = "Singaporean Category";
let openCategoryName = "Open Category";

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
