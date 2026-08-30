import test from 'node:test';
import assert from 'node:assert/strict';
import {program,filmURL,musicURL} from '../lib/program.mjs';
test('eight unique films and eight album choices',()=>{assert.equal(program.length,8);assert.equal(new Set(program.map(f=>f.title)).size,8);assert.equal(new Set(program.map(f=>f.album)).size,8);});
test('feature-length metadata and valid media filenames',()=>{for(const f of program){assert.ok(f.minutes>=40);assert.ok(f.year>=1920&&f.year<=1929);assert.ok(f.file.endsWith('.mp4'));assert.ok(filmURL(f).startsWith('https://archive.org/download/'));assert.equal(decodeURIComponent(new URL(filmURL(f)).pathname.split('/').pop()),f.file);}});
test('album URLs loop and include origin',()=>{for(const f of program){const u=new URL(musicURL(f,false,'https://example.com'));assert.equal(u.searchParams.get('list'),f.list);assert.equal(u.searchParams.get('loop'),'1');assert.equal(u.searchParams.get('origin'),'https://example.com');}});
test('fallback repeats just the labeled opening track',()=>{for(const f of program){assert.match(f.first,/^[A-Za-z0-9_-]{11}$/);const u=new URL(musicURL(f,true,'https://example.com'));assert.equal(u.searchParams.get('playlist'),f.first);assert.equal(u.searchParams.has('list'),false);assert.equal(u.pathname,'/embed/'+f.first);}});
