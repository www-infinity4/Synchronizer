export const program=[
  {
    "title": "Our Hospitality",
    "year": 1923,
    "credit": "Buster Keaton & John G. Blystone",
    "archive": "OurHospitality_29",
    "file": "OurHospitality_512kb.mp4",
    "minutes": 73,
    "artist": "Lynyrd Skynyrd",
    "album": "Pronounced ’Lĕh-’nérd ’Skin-’nérd",
    "list": "PLNDXDJtQAOal3gqF6hsiF25nXD0517wLF",
    "first": "9ER6P8RgZK4",
    "note": "Rustic comedy, train travel, and a river chase meet southern guitar rock."
  },
  {
    "title": "The Ten Commandments",
    "year": 1923,
    "credit": "Cecil B. DeMille",
    "archive": "TheTenCommandments1923NR_201503",
    "file": "The Ten Commandments (1923) [NR].mp4",
    "minutes": 136,
    "artist": "Pink Floyd",
    "album": "The Wall",
    "list": "PLVa0FISlydhlzMUJaHAfAC8tvpAttFyGq",
    "first": "uzsEmI61Xas",
    "note": "Epic spectacle and a modern morality tale meet a theatrical album about isolation and control."
  },
  {
    "title": "Sherlock Jr.",
    "year": 1924,
    "credit": "Buster Keaton",
    "archive": "sherlock-jr.-1924",
    "file": "Sherlock Jr.1924.mp4",
    "minutes": 45,
    "artist": "Tom Petty",
    "album": "Full Moon Fever",
    "list": "PLNPGM2D7aODcGhtGIPx1COW1nUUyRnpWV",
    "first": "1lWJXDG2i0A",
    "note": "A fresh experiment for Keaton’s dream-world comedy: bright hooks, motion, and a touch of mischief."
  },
  {
    "title": "The Navigator",
    "year": 1924,
    "credit": "Buster Keaton & Donald Crisp",
    "archive": "mymovie_202004",
    "file": "My Movie.mp4",
    "minutes": 60,
    "artist": "Boston",
    "album": "Boston",
    "list": "PLNPGM2D7aODcqspWSzcLS1CBiG2bm5k3K",
    "first": "t4QK8RxCAwo",
    "note": "An ocean-going comedy with soaring guitars and a buoyant, melodic pulse."
  },
  {
    "title": "The Thief of Bagdad",
    "year": 1924,
    "credit": "Raoul Walsh · Douglas Fairbanks",
    "archive": "vidtb",
    "file": "vidtb.mp4",
    "minutes": 151,
    "artist": "Queen",
    "album": "A Night at the Opera",
    "list": "PLKsS-HV7qF3PWB2ux_JujxC7MDqT8CGfP",
    "first": "kqVpk0qxmfA",
    "note": "Grand fantasy sets and impossible adventures meet Queen’s theatrical changes of scale."
  },
  {
    "title": "The Last Laugh",
    "year": 1924,
    "credit": "F. W. Murnau",
    "archive": "silent-the-last-laugh",
    "file": "The Last Laugh.mp4",
    "minutes": 90,
    "artist": "Bob Seger & the Silver Bullet Band",
    "album": "Night Moves",
    "list": "PLQMQ0pEi2Ffr1kFMqnD8w6sGoBTBG8pBN",
    "first": "s8bFzQ_u0Ts",
    "note": "Working-life pride, loss, and unexpected turns, with warm heartland rock."
  },
  {
    "title": "The Gold Rush",
    "year": 1925,
    "credit": "Charlie Chaplin",
    "archive": "the-gold-rush-film-1925",
    "file": "The-Gold-Rush-1925.mp4",
    "minutes": 87,
    "artist": "Kenny Rogers",
    "album": "The Gambler",
    "list": "PLDvCA_Xe1Vpo0ky2Xd5j7ZzE0pjXmXAij",
    "first": "7hx4gdlfamo",
    "note": "A prospector chasing luck finds a natural companion in country storytelling."
  },
  {
    "title": "The Lost World",
    "year": 1925,
    "credit": "Harry O. Hoyt",
    "archive": "TheLostWorldCompleteVideoQualityUpgrade",
    "file": "TheLostWorldCompleteVideoQualityUpgrade.mp4",
    "minutes": 76,
    "artist": "Stevie Ray Vaughan & Double Trouble",
    "album": "Texas Flood",
    "list": "PL02pDPRbhcyaas4VyaJCk9CszCZ88-_3F",
    "first": "HYUy9CBDCE4",
    "note": "Stop-motion creatures and expedition adventure meet expressive, hard-driving blues guitar."
  }
];
export function filmURL(item){return "https://archive.org/download/"+item.archive+"/"+encodeURIComponent(item.file);}
export function musicURL(item,fallback,origin){
 const p=new URLSearchParams({enablejsapi:"1",origin,playsinline:"1",loop:"1"});
 if(fallback)p.set("playlist",item.first);else{p.set("listType","playlist");p.set("list",item.list);}
 return "https://www.youtube.com/embed/"+(fallback?item.first:"videoseries")+"?"+p;
}
