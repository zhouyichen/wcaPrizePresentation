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

