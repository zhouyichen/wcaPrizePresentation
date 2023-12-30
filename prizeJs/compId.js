let compId = '';
let targetCountryIso2 = "";
let compSponsor = "";
window.location.search.substr(1).split("&").forEach(function(item) {
    if (item.split("=")[0] === 'compId') {
        compId = item.split("=")[1];
    }
});
console.log('compId:' + compId);

const specialCategoryName = "Singaporean Category";
let openCategoryName = "Open Category";

