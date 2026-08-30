# Synchronizer

Infinity ® eight-film alternate-soundtrack cinema. Full movies play muted on the page alongside repeating YouTube albums. No uploads or live AI service are needed. This is not the experimental Flix Blender: it does not jump among short clips.

## Program

| Film | Year | Album | Artist |
|---|---|---|---|
| Our Hospitality | 1923 | Pronounced ’Lĕh-’nérd ’Skin-’nérd | Lynyrd Skynyrd |
| The Ten Commandments | 1923 | The Wall | Pink Floyd |
| Sherlock Jr. | 1924 | Full Moon Fever | Tom Petty |
| The Navigator | 1924 | Boston | Boston |
| The Thief of Bagdad | 1924 | A Night at the Opera | Queen |
| The Last Laugh | 1924 | Night Moves | Bob Seger & the Silver Bullet Band |
| The Gold Rush | 1925 | The Gambler | Kenny Rogers |
| The Lost World | 1925 | Texas Flood | Stevie Ray Vaughan & Double Trouble |

These are editorial pairings, not claims of intentional historical synchronization. Sherlock Jr. gets a new Tom Petty experiment here; the existing Winwood pairing in Vintech is unchanged.

## Controls

Choose one of eight channels. Start pairing, Pause pairing, Resume pairing and Restart coordinate the two players. Next film selects the next full feature; switching destroys the previous music player and pauses the previous movie. The album is configured to loop. Only one video and one music embed are mounted at a time.

The film's native controls and the visible YouTube controls also work independently. Browsers may require a tap inside YouTube to allow music. Ads, buffering and provider restrictions can shift timing. The app does not promise frame-exact synchronization or buffer-free streaming.

Music recovery includes Next song, Reload music and a clearly labeled opening-track fallback. In fallback mode only that song repeats; Restore full album returns to the album playlist. No automatic substitution is disguised as a full album.

## GitHub Pages

In Settings → Pages choose Deploy from a branch → main → / (root) → Save.

Expected URL once enabled: https://www-infinity4.github.io/Synchronizer/

The committed index.html, app.js and styles.css need no build workflow. GitHub repository delivery alone does not confirm that Pages is enabled or deployed.

To edit: change app/page.tsx, app/theater.css or lib/program.mjs; run `npm install`, `npm test`, and `npm run build`; commit both sources and rebuilt outputs. Use HTTP(S), not file://, for embedded playback.

## Validation and source notes

- All eight exact movie URLs returned HTTP 206, video/mp4 and the requested 1,024-byte range on 2026-08-30.
- Runtime metadata was inspected for each selected MP4. Two misleading short excerpts were rejected before publication. Selected Ten Commandments and Thief of Bagdad copies run about 136 and 151 minutes.
- Four Node tests check eight distinct films/albums, feature-length metadata, URL encoding, looping album parameters and explicit single-track fallback behavior.
- Opening-track/fallback YouTube IDs returned appropriate title/artist embed metadata for all eight pairings.
- Album playlists were found via current catalog/search results. Full track-by-track availability, regional playback and end-to-end browser viewing remain unverified.
- The Gold Rush source is labeled 1925 and has no audio; selected file metadata is about 87 minutes. The Last Laugh was first released in 1924; this Archive item's date is 1925. Prints, restorations, intertitles and running speeds can differ.
- Films may contain historical stereotypes, tinted sequences, or restored material. Online availability does not establish permission for every restoration, score or commercial reuse. Retain source attribution and player controls.
- No media files are redistributed here. No ads contract, wallet, payout system or automated rights clearance is implemented.

## Source pages

- Our Hospitality: [film source](https://archive.org/details/OurHospitality_29) · [album source](https://www.youtube.com/playlist?list=PLNDXDJtQAOal3gqF6hsiF25nXD0517wLF)
- The Ten Commandments: [film source](https://archive.org/details/TheTenCommandments1923NR_201503) · [album source](https://www.youtube.com/playlist?list=PLVa0FISlydhlzMUJaHAfAC8tvpAttFyGq)
- Sherlock Jr.: [film source](https://archive.org/details/sherlock-jr.-1924) · [album source](https://www.youtube.com/playlist?list=PLNPGM2D7aODcGhtGIPx1COW1nUUyRnpWV)
- The Navigator: [film source](https://archive.org/details/mymovie_202004) · [album source](https://www.youtube.com/playlist?list=PLNPGM2D7aODcqspWSzcLS1CBiG2bm5k3K)
- The Thief of Bagdad: [film source](https://archive.org/details/vidtb) · [album source](https://www.youtube.com/playlist?list=PLKsS-HV7qF3PWB2ux_JujxC7MDqT8CGfP)
- The Last Laugh: [film source](https://archive.org/details/silent-the-last-laugh) · [album source](https://www.youtube.com/playlist?list=PLQMQ0pEi2Ffr1kFMqnD8w6sGoBTBG8pBN)
- The Gold Rush: [film source](https://archive.org/details/the-gold-rush-film-1925) · [album source](https://www.youtube.com/playlist?list=PLDvCA_Xe1Vpo0ky2Xd5j7ZzE0pjXmXAij)
- The Lost World: [film source](https://archive.org/details/TheLostWorldCompleteVideoQualityUpgrade) · [album source](https://www.youtube.com/playlist?list=PL02pDPRbhcyaas4VyaJCk9CszCZ88-_3F)

The machine-readable source filenames, artist choices, playlist IDs and runtimes are in lib/program.mjs.
