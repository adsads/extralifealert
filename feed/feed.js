var test = false;
var donationsQueue = [];
var test2 = false;
var CHECK_INTERVAL = 30000;
var donationsInterval;
var fetchInterval;

function processDonations(donations) {
  var promise = new Promise(function(resolve, reject){
    var sliced = donations.slice(0, 10);
    var currentTime = new Date().getTime();

    if(test) {
      var q = new Date().getTime() - 5;
      sliced.push({
        message: "Hello World",
        createdOn: q,
        donorName: 'thelanzolini',
        avatarImageURL: "//assets.donordrive.com/clients/extralife/img/avatar-constituent-default.gif",
        donationAmount: 5
      });
      test2 = true;
    }
    test = true;

    sliced.forEach(function(donation, index){
      var donationTime = new Date(donation.createdOn).getTime();
      if(currentTime - donationTime < CHECK_INTERVAL){
        donationsQueue.push(donation);
      }
    });

    donationsCache = sliced;
    resolve(sliced);
  });
  return promise;
}

function fetchRecentDonations(participantID) {
  if(test2) return;
  return window.fetch('https://www.extra-life.org/index.cfm?fuseaction=donorDrive.participantDonations&participantID='+ participantID +'&format=json', { mode: 'cors' })
    .then(function(response){
      return response.json();
    })
    .then(processDonations)
  ;
}

function renderFeed(){
  var APP = document.getElementById('app');

  var search = location.search.substring(1);
  var config = JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')

  console.log(config);
  var donationAlert = document.createElement('div');
  donationAlert.classList.add('hidden', 'donation-alert');
  var donationText = document.createElement('div');
  donationText.classList.add('donation-alert-text');
  var donationMessage = document.createElement('div');
  donationMessage.classList.add('donation-alert-message');

  var audio = document.createElement('audio');
  audio.src = config.audio;

  var donationImg = document.createElement('img');
  donationImg.src = config.image;

  donationAlert.appendChild(donationImg);
  donationAlert.appendChild(donationText);
  donationAlert.appendChild(donationMessage);

  APP.appendChild(donationAlert);

  if(config.debug) {
    donationText.innerHTML = 'User has donated $5!';
    donationMessage.innerHTML = 'Here is $5, I hope this helps!';
    donationAlert.classList.remove('hidden');
  }

  fetchInterval = setInterval(function(){
    fetchRecentDonations(config.participantID).then(console.log)
  }, CHECK_INTERVAL);

  donationsInterval = setInterval(function(){
    var donation = donationsQueue.pop();
    if(!!donation){
      console.log("NEW DONATION", donation);
      audio.play();
      donationAlert.classList.add('fade');
      donationText.innerHTML = donation.donorName + ' has donated $' + donation.donationAmount + '!';
      donationMessage.innerHTML = donation.message;
      setTimeout(function(){
        donationText.innerHTML = '';
      }, 4500);
    }
  }, 5000);

}

document.addEventListener('DOMContentLoaded', renderFeed)
