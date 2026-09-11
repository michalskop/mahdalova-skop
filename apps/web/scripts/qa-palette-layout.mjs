import fs from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
import {feature} from 'topojson-client';
import {geoPath} from 'd3-geo';
const base='apps/web/components/clanek/TrueSizeGame/';
const geometry=await fs.readFile(base+'geometry.ts','utf8');
const temp=new URL('./.palette-geometry.mjs',import.meta.url);
await fs.writeFile(temp,ts.transpileModule(geometry,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
try {
 const g=await import(temp.href);
 for(let i=0;i<100;i++)for(const n of [5,10,15]){const colors=g.chooseColors(n);assert.equal(new Set(colors).size,n);assert.ok(colors.every(c=>g.COLORS.includes(c)));}
 const source=await fs.readFile(base+'TrueSizeGame.tsx','utf8');
 const fn=source.slice(source.indexOf('function spreadPieces'),source.indexOf('type Rect ='));
 const compiled=ts.transpileModule(fn,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 const spread=new Function('geoPath','makeProjection','HEIGHT','WIDTH','areaKm2','placeCountry',compiled+';return spreadPieces;')(geoPath,g.makeProjection,g.HEIGHT,g.WIDTH,g.areaKm2,g.placeCountry);
 const world=JSON.parse(await fs.readFile('apps/web/public/specialy/dpbp/data/world-countries-110m.json','utf8'));
 const countries=feature(world,world.objects.countries).features;
 const map=new Map(countries.map(c=>[c.properties.name,c]));
 const pool=JSON.parse(source.match(/const CURATED_COUNTRIES = (\[[\s\S]*?\]);/)[1].replace(/\/\/[^\n]*/g,'').replace(/,\s*]/g,']'));
 let overlaps=0;
 for(const projection of g.PROJECTIONS) for(const n of [5,10,15]) {
  const names=[...pool].sort(()=>Math.random()-.5).slice(0,n);
  const pieces=spread(names.map((name,i)=>({id:i,name,lon:0,lat:0,angle:0,pinned:false,color:'#522a7a'})),map,projection.id);
  const path=geoPath(g.makeProjection(projection.id));
  const boxes=pieces.map(p=>path.bounds(g.placeCountry(map.get(p.name),p)));
  for(let i=0;i<n;i++)for(let j=0;j<i;j++)if(Math.min(boxes[i][1][0],boxes[j][1][0])>Math.max(boxes[i][0][0],boxes[j][0][0])&&Math.min(boxes[i][1][1],boxes[j][1][1])>Math.max(boxes[i][0][1],boxes[j][0][1]))overlaps++;
 }
 assert.equal(overlaps,0,'Initial bounding boxes overlap');
 console.log('PASS: palette membership, unique colors and nonoverlapping 5/10/15-country layouts in six projections');
}finally{await fs.unlink(temp);}
