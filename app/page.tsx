"use client";
import {useEffect,useRef,useState} from "react";
import {Button} from "@/components/ui/button";
import {program,filmURL,musicURL} from "@/lib/program.mjs";

type Player={playVideo():void;pauseVideo():void;playVideoAt(n:number):void;seekTo(n:number,b:boolean):void;nextVideo():void;setLoop(b:boolean):void;destroy():void};
type YT={Player:new(el:HTMLElement,o:Record<string,unknown>)=>Player};
let api:Promise<YT>|undefined;
function loadYouTube(){
 const w=window as unknown as {YT?:YT;onYouTubeIframeAPIReady?:()=>void};
 if(w.YT?.Player)return Promise.resolve(w.YT);
 if(!api)api=new Promise<YT>((resolve,reject)=>{
  let done=false;const script=document.createElement("script");
  const timer=setTimeout(fail,15000);
  function fail(){if(done)return;done=true;clearTimeout(timer);api=undefined;script.remove();reject(Error("Music controls unavailable"));}
  w.onYouTubeIframeAPIReady=()=>{if(done)return;done=true;clearTimeout(timer);resolve(w.YT!);};
  script.src="https://www.youtube.com/iframe_api";script.onerror=fail;document.head.appendChild(script);
 });
 return api;
}
function Theater({index,next}:{index:number;next:()=>void}){
 const item=program[index],film=useRef<HTMLVideoElement>(null),mount=useRef<HTMLDivElement>(null),music=useRef<Player|null>(null),alive=useRef(true),intent=useRef(false),request=useRef(0);
 const [ready,setReady]=useState(false),[running,setRunning]=useState(false),[started,setStarted]=useState(false),[ended,setEnded]=useState(false),[revision,setRevision]=useState(0),[fallback,setFallback]=useState(false),[filmError,setFilmError]=useState(""),[musicError,setMusicError]=useState(""),[status,setStatus]=useState("Press Start pairing. Your browser may also need a tap inside the music player.");
 useEffect(()=>{
  alive.current=true;let disposed=false,p:Player|undefined;setReady(false);setMusicError("");
  const box=mount.current!,frame=document.createElement("iframe");
  frame.src=musicURL(item,fallback,window.location.origin);frame.title=item.artist+" — "+(fallback?"opening-track fallback":item.album);
  frame.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";frame.allowFullscreen=true;frame.referrerPolicy="strict-origin-when-cross-origin";box.appendChild(frame);
  loadYouTube().then(yt=>{
   if(disposed)return;
   p=new yt.Player(frame,{events:{
    onReady:()=>{if(disposed)return;music.current=p!;p!.setLoop(true);setReady(true);},
    onError:(e:{data:number})=>{if(disposed)return;intent.current=false;request.current++;film.current?.pause();setRunning(false);setMusicError("YouTube could not play this selection (code "+e.data+"). Try Next song, Reload music, or the labeled opening-track fallback.");},
    onAutoplayBlocked:()=>{if(disposed)return;intent.current=false;request.current++;film.current?.pause();setRunning(false);setStatus("Tap Play inside YouTube to allow sound, then Resume pairing.");}
   }});
  }).catch(()=>{if(!disposed)setMusicError("Shared music controls could not connect. The visible music player and film still have independent controls.");});
  return()=>{disposed=true;music.current=null;p?.destroy();box.replaceChildren();};
 },[revision,fallback,item]);
 useEffect(()=>{const v=film.current;return()=>{alive.current=false;intent.current=false;request.current++;v?.pause();};},[]);
 function pause(){
  intent.current=false;request.current++;film.current?.pause();music.current?.pauseVideo();setRunning(false);
  if(!music.current)setRevision(n=>n+1);
 }
 function start(reset=false){
  if(filmError)return;
  const v=film.current;if(!v)return;const restart=reset||!started||ended;
  const id=++request.current;intent.current=true;setStarted(true);setEnded(false);setRunning(true);
  if(restart){v.currentTime=0;if(fallback){music.current?.seekTo(0,true);music.current?.playVideo();}else music.current?.playVideoAt(0);}else music.current?.playVideo();
  v.muted=true;v.play().catch(()=>{if(alive.current&&id===request.current){pause();setStatus("The movie did not start. Use its Play button, then Resume pairing.");}});
  setStatus(ready?"Playback requested for both. Restart returns the film and album to their beginnings.":"Movie playback requested. Tap Play inside YouTube while shared controls connect.");
 }
 function resetMusic(useFallback=fallback){pause();setFallback(useFallback);setRevision(n=>n+1);setStatus("Music reset. Press Start or Resume when it is ready.");}
 return <section className="theater" aria-label={item.title+" paired with "+item.album}>
 <div className="screen-bar"><span>CHANNEL {String(index+1).padStart(2,"0")} / PICTURE</span><span>FILM SOUND OFF</span></div>
 <video ref={film} src={filmURL(item)} poster={"https://archive.org/services/img/"+item.archive} muted playsInline controls preload="metadata" aria-label={item.title}
 onPlay={()=>{intent.current=true;setRunning(true);}}
 onPause={()=>{setRunning(false);}}
 onVolumeChange={()=>{if(film.current&&!film.current.muted)film.current.muted=true;}}
 onEnded={()=>{pause();setEnded(true);setStatus("Feature finished. Choose Next film to continue.");}}
 onError={()=>{pause();setFilmError("This movie could not load from Internet Archive. Retry it or choose another film.");}}/>
 <div className="picture-title"><div><p className="eyebrow">{item.year} / {item.credit}</p><h2>{item.title}</h2></div><span className="runtime">{item.minutes} MIN<span>THIS PRINT</span></span></div>
 {filmError&&<div className="error" role="alert">{filmError}<Button variant="outline" onClick={()=>{setFilmError("");film.current?.load();}}>Retry movie</Button></div>}
 <div className="sound-row"><div className="sound-info"><p className="eyebrow">ALTERNATE SOUNDTRACK / ↻ REPEAT</p><h3>{item.album}</h3><p className="artist">{item.artist}</p>
 <div className="transport"><Button disabled={!!filmError} onClick={()=>running?pause():start()}>{running?"Ⅱ Pause pairing":started?"▶ Resume pairing":"▶ Start pairing"}</Button><Button variant="outline" disabled={!!filmError} onClick={()=>start(true)}>↻ Restart</Button><Button variant="outline" onClick={next}>Next film →</Button></div>
 <p className="status" role="status">{status}</p>
 <div className="tools"><Button variant="ghost" disabled={!ready||fallback} onClick={()=>{music.current?.nextVideo();setMusicError("");setStatus("Next song requested. Resume the movie when ready.");}}>Next song →</Button><Button variant="ghost" onClick={()=>resetMusic()}>Reload music</Button><Button variant="ghost" onClick={()=>resetMusic(!fallback)}>{fallback?"Restore full album":"Try opening track only"}</Button></div>
 {fallback&&<p className="notice">Fallback mode: only the opening song repeats, not the full album.</p>}
 {musicError&&<p className="error" role="alert">{musicError}</p>}
 </div><div className="music-player" ref={mount}/></div>
 <div className="curation"><p className="eyebrow">THE CONNECTION</p><p>{item.note}</p><div><a href={"https://archive.org/details/"+item.archive} target="_blank" rel="noreferrer">Movie source ↗</a><a href={fallback?"https://www.youtube.com/watch?v="+item.first:"https://www.youtube.com/playlist?list="+item.list} target="_blank" rel="noreferrer">Music source ↗</a></div></div>
 </section>;
}
export default function Home(){
 const [selected,setSelected]=useState(0);
 return <main><header><a href="./" className="brand">SYNCHRONIZER<span>08</span></a><p>EIGHT FILMS / EIGHT FREQUENCIES</p><span className="identity">Infinity ®</span></header>
 <div className="intro"><h1>Find your frequency.</h1><p>Full-length silent cinema. A different album for every picture.</p></div>
 <div className="layout"><nav className="channels" aria-label="Choose one of eight films"><div className="nav-title"><span>THE PROGRAM</span><span>01—08</span></div>{program.map((f,i)=><Button key={f.title} variant="outline" className={i===selected?"channel selected":"channel"} aria-pressed={i===selected} onClick={()=>setSelected(i)}><span className="num">{String(i+1).padStart(2,"0")}</span><span className="channel-text"><strong>{f.title}</strong><small>{f.year} · {f.artist}</small></span><span className="signal">{i===selected?"●":"↗"}</span></Button>)}<p className="nav-foot">ONE PICTURE AT A TIME.<br/>NO CLIP JUMPING. NO UPLOADS.</p></nav>
 <Theater key={selected} index={selected} next={()=>setSelected(n=>(n+1)%program.length)}/></div>
 <footer><span>SYNCHRONIZER / Infinity ®</span><p>Switching films stops the previous players. Albums repeat; ads and buffering can shift timing.<br/>Shared start and pause, not guaranteed frame-perfect synchronization. Player controls also work independently.</p></footer>
 </main>;
}
