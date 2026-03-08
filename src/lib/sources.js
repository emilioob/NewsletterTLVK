function googleNewsSearch(query) {
  const encoded = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-SG&gl=SG&ceid=SG:en`;
}

export const sourceFeeds = [
  {
    name: "SEA travel market stress",
    url: googleNewsSearch(
      '(travel demand OR route suspension OR booking slowdown OR tourism slump) (Southeast Asia OR Singapore OR Indonesia OR Thailand OR Vietnam OR Philippines OR Malaysia) (airline OR hotel OR tourism)'
    ),
    sectionHint: "market"
  },
  {
    name: "Travel disruption and climate",
    url: googleNewsSearch(
      '(typhoon OR flooding OR volcano OR wildfire OR earthquake OR war OR advisory) (airport OR flights OR tourism) (Asia OR Southeast Asia)'
    ),
    sectionHint: "market"
  },
  {
    name: "OTA competition",
    url: googleNewsSearch(
      '(Traveloka OR Agoda OR Booking.com OR Expedia OR Airbnb OR Trip.com OR tiket.com) (acquisition OR partnership OR launch OR expansion OR market entry OR loyalty)'
    ),
    sectionHint: "competitor"
  },
  {
    name: "Aviation network changes",
    url: googleNewsSearch(
      '(new route OR route cut OR capacity cut OR capacity increase) (Southeast Asia OR Japan OR Australia OR India) airline'
    ),
    sectionHint: "market"
  },
  {
    name: "Travel regulation and borders",
    url: googleNewsSearch(
      '(visa OR tourism tax OR travel advisory OR airport closure OR regulation) (Southeast Asia OR Asia travel)'
    ),
    sectionHint: "market"
  }
];
