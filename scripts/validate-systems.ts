import {NodeIO,getBounds} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {readFile} from 'node:fs/promises';
await MeshoptDecoder.ready;
const p=JSON.parse(await readFile('public/models/body-systems-provenance.json','utf8'));
const ui=JSON.parse(await readFile('src/data/body-systems-inventory.json','utf8'));
if(JSON.stringify(p)!==JSON.stringify(ui))throw Error('Runtime inventory and provenance differ');
const expected=new Map(p.structures.map((s:{id:string})=>[s.id,s]));
if(expected.size!==1279)throw Error('Expected 1279 unique additional structures');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const found=new Set<string>();
for(const asset of ['muscles.glb','nerves.glb','skin.glb','visceral-extra.glb','lymphatic.glb']){
 const doc=await io.read(`public/models/${asset}`),nodes=doc.getRoot().listNodes().filter(n=>n.getMesh());
 for(const node of nodes){let e=node.getExtras();let owner=node;while(!e.partId){const parent=owner.listParents().find(p=>p.propertyType==='Node');if(!parent)break;owner=parent as typeof node;e=owner.getExtras();}const record=expected.get(e.partId as string) as {asset:string;name:string;system:string}|undefined;if(!record||record.asset!==asset||record.name!==e.partName||record.system!==e.system||found.has(e.partId as string))throw Error(`Invalid metadata ${node.getName()}`);found.add(e.partId as string);for(const primitive of node.getMesh()!.listPrimitives())if(!primitive.getAttribute('POSITION')?.getCount())throw Error('Empty geometry');}
 const b=getBounds(doc.getRoot().listScenes()[0]);if(![...b.min,...b.max].every(Number.isFinite))throw Error('Invalid model bounds');console.log(asset,nodes.length);
}
if(found.size!==expected.size)throw Error('Model inventory is incomplete');
console.log('PASS — 1279 additional structures across seven systems; valid geometry, IDs, provenance and UI inventory.');
