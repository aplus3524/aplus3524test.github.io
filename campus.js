import {SOCIETIES} from './business.js';
import {context,random,clamp,dateLabel,record,effects,placementActive} from './engine.js';
const memo=(s,title,text)=>{s.notes.push({title,text,tag:'Campus'});record(s,title,text,'Campus');};
export const runsSociety=m=>!!m&&(m.running===true||m.role==='Committee member');
export const societyTerms=m=>m?.teachingTurns?.length||0;
export function upgradeCampus(s){
 if(s.campusEdition===3)return s;
 s.societies??=[];s.achievements??=[];s.skills??={finance:0,consulting:0,people:0,data:0};
 for(const m of s.societies){m.teachingTurns??=[...new Set(s.log.filter(x=>x.title===m.name&&x.tag==='Campus'&&[0,2].includes(x.turn%4)).map(x=>x.turn))];m.running=runsSociety(m);}
 s.caseRecord??={unlocked:false,localEntries:0,localAwards:s.flags.award?1:0,localChampions:0,internationalEntries:0,internationalAwards:0,internationalChampions:0,lastApplied:null,history:[]};
 s.caseEvents??={};s.campusEdition=3;
 if(s.status==='plan')s.plan.actions=s.plan.actions.map(id=>id==='society'?`society:${s.societyTarget||'bea'}`:id==='committee'?`committee:${s.societies.find(m=>societyTerms(m)>=2)?.id||s.societyTarget||'bea'}`:id).filter(id=>!id.startsWith('society:')||context(s).term||runsSociety(s.societies.find(m=>m.id===id.split(':')[1])));
 checkCaseUnlock(s,false);return s;
}
export function campusAction(s,id){
 if(id==='caseinternational')return {id,name:'Represent HKU internationally',desc:'Form a team and seek selection. Reserve 3 slots for selection, three training weekends and a sponsored trip.',category:'Career',icon:'✦',time:3,cost:0,special:id};
 const [kind,key]=id.split(':');if(!['society','committee'].includes(kind))return null;const x=SOCIETIES.find(x=>x.id===key);if(!x)return null;
 const m=s.societies.find(m=>m.id===key),lead=kind==='committee';
 return {id,name:`${lead?'Run for committee':context(s).term?'Society participation':'Organise break activities'} · ${x.name}`,desc:lead?'Take responsibility for this group after two teaching semesters.':context(s).term?x.desc:'You run this society: organise its projects and prepare activities during the break.',category:'Campus',icon:lead?'⚑':x.group==='Sports'?'↝':x.group==='Arts & fun'?'◈':'✳',time:lead?2:1,cost:300,effects:lead?{network:7,career:5,energy:-9,academic:-.1}:x.group==='Sports'?{bonds:7,wellbeing:8,energy:3}:x.group==='Arts & fun'?{bonds:7,wellbeing:6,creative:5,energy:-2}:{bonds:7,network:5,energy:-4},special:id};
}
export function campusActions(s){return [campusAction(s,'caseinternational'),...s.plan.actions.filter(id=>id.includes(':')).map(id=>campusAction(s,id)).filter(Boolean)];}
export function campusReason(s,a){
 const c=context(s),[kind,key]=a.id.split(':');
 if(['society','committee'].includes(kind)){
  const m=s.societies.find(m=>m.id===key);
  if(!c.term&&(kind==='committee'||!runsSociety(m)))return 'Winter and summer society work is for students running this particular group.';
  if(kind==='committee'&&runsSociety(m))return 'You already run this society. Choose its participation activity.';
  if(kind==='committee'&&societyTerms(m)<2)return 'Attend this society for two teaching semesters before running for committee.';
  if(s.plan.actions.includes(`${kind==='society'?'committee':'society'}:${key}`))return 'Choose participation or committee work for this group this semester; committee work includes participation.';
  if(s.plan.actions.some(id=>['exchange','global'].includes(id)))return 'Home-campus society work does not overlap an overseas study phase.';
 }
 if(a.id==='caseinternational'){
  if(!c.term)return 'Team selection opens once each teaching semester.';
  if(!s.caseRecord.unlocked)return 'Unlock through two completed HICS teaching semesters with strong case readiness, or a local case award.';
  if(s.caseRecord.lastApplied===s.turn)return 'Your team has already applied this semester. You can try again next semester.';
  if(s.plan.actions.some(id=>['exchange','global'].includes(id)))return 'Keep a home semester free for training and the competition trip.';
 }
 if(['exchange','global'].includes(a.id)&&s.plan.actions.some(id=>/^(society:|committee:|caseinternational$)/.test(id)))return 'Remove home-campus society or international case commitments before overseas study.';
 return '';
}
export function caseReadiness(s){return Math.round(clamp((s.skills.consulting||0)*.45+s.knowledge*.3+s.career*.25+Math.min(4,societyTerms(s.societies.find(m=>m.id==='hics')))*5));}
export function checkCaseUnlock(s,notify=true){
 const r=s.caseRecord;if(!r||r.unlocked)return;
 if(r.localAwards>0||societyTerms(s.societies.find(m=>m.id==='hics'))>=2&&caseReadiness(s)>=35){r.unlocked=true;r.unlockedTurn=s.turn;if(notify)memo(s,'International case pathway unlocked','Your case record opens a permanent route to form a team once per teaching semester. Selection is competitive; selected teams complete three training weekends before an HKU-sponsored trip.');}
}
export const casePriority=s=>s.caseRecord.internationalChampions>0?'International champion priority':s.caseRecord.localChampions>0?'Local champion priority':s.caseRecord.localAwards+s.caseRecord.internationalAwards>0?'Award-winner priority':'Developing team';
export function selectionScore(s,team){const r=s.caseRecord,bonus=r.internationalChampions?24:r.localChampions?18:r.localAwards+r.internationalAwards?8:0;return caseReadiness(s)+bonus+(team==='balanced'?8:team==='specialists'?(s.skills.finance+s.skills.data>=25?12:2):3)-(s.energy<25?12:0);}
function addEvent(s,id,title,text,choices){const e={id:`case-${s.turn}-${id}`,category:'Case competitions',title,text,choices};s.caseEvents[e.id]=e;return e.id;}
const choice=(label,hint,special,effects={})=>({label,hint,special,effects});
export function runCampusAction(s,id){
 const [kind,key]=id.split(':');
 if(['society','committee'].includes(kind)){
  const x=SOCIETIES.find(x=>x.id===key);let m=s.societies.find(m=>m.id===key);
  if(!m){m={id:key,name:x.name,terms:0,teachingTurns:[],role:'Participant',running:false};s.societies.push(m);}
  m.terms++;if(context(s).term&&!m.teachingTurns.includes(s.turn))m.teachingTurns.push(s.turn);
  if(kind==='committee'){m.running=true;m.role='Committee member';s.flags.leadership=true;}else if(!runsSociety(m)&&societyTerms(m)>=2)m.role='Project contributor';
  s.flags.society=true;s.skills[x.skill]=(s.skills[x.skill]||0)+(key==='hics'?8:4);
  memo(s,x.name,`${m.role} · ${societyTerms(m)} teaching semester(s) attended.${context(s).term?'':' You organise break activities as a committee member.'}`);return [];
 }
 if(id==='competition'){
  s.skills.consulting+=8;s.caseRecord.localEntries++;
  return [addEvent(s,'local','Your local case competition','The team has a solution. Before presenting to a simulated Hong Kong business-case panel, what gets your final attention?',[
   choice('Test the numbers and sharpen the story','Evidence and a coherent recommendation','case:local:evidence',{energy:-4,knowledge:3}),
   choice('Rehearse together and challenge assumptions','Stronger teamwork and delivery','case:local:team',{energy:-3,bonds:3}),
   choice('Improvise on the day','Save energy; a less prepared presentation','case:local:improvise',{energy:3})])];
 }
 if(id==='caseinternational'){
  const r=s.caseRecord;r.lastApplied=s.turn;
  s.caseAttempt={turn:s.turn,city:['Singapore','Copenhagen','Rotterdam','Vancouver'][Math.floor(random(s)*4)],status:'application',weekends:0,training:0,threshold:45+random(s)*30};
  return [addEvent(s,'selection','Build the team you want to represent HKU','Choose a team for this semester’s international nomination. Case capability, energy, complementary skills and past awards affect selection. Former champions receive the strongest priority. Three slots are reserved for selection, training and travel; unused training time becomes rest if you are not selected.',[
   choice('Build a balanced team','Combine analysis, finance and presentation strengths','case:select:balanced'),
   choice('Bring technical specialists','Best when your finance and data skills are developed','case:select:specialists'),
   choice('Team up with close friends','Familiarity and connection; less emphasis on complementary skills','case:select:friends',{bonds:4})])];
 }
 return null;
}
function appendNext(s,id){s.queue.splice(s.eventIndex+1,0,id);}
function trainingEvent(s){const a=s.caseAttempt,n=a.weekends+1,titles=['Case cracking & research','Financial analysis & feasibility','Presentation & judge Q&A'];return addEvent(s,`training-${n}`,`Training weekend ${n} of 3 · ${titles[n-1]}`,`Your team is selected for a simulated international invitational in ${a.city}. All three weekends must be completed before departure. HKU covers travel, accommodation, entry fees and training in this game.`,[
 choice('Prepare thoroughly and work through feedback','Build case skills; spend energy',`case:train:deep`,{energy:-5}),
 choice('Practise at a sustainable pace','Complete the weekend with a lighter workload',`case:train:steady`,{energy:-2}),
 choice('Withdraw from this trip','Keep the pathway open for another semester',`case:withdraw`,{energy:6})]);}
function finalEvent(s){return addEvent(s,'international','You are representing HKU',`Three training weekends completed. Your team arrives in ${s.caseAttempt.city} for the simulated International Business Case Invitational. HKU has covered the trip. The result now depends on preparation, delivery and the strength of the field.`,[
 choice('Make a clear, evidence-led recommendation','Use your analysis and preparation','case:final:evidence',{energy:-3}),
 choice('Trust the team and adapt in Q&A','Draw on teamwork and presentation practice','case:final:team',{energy:-3}),
 choice('Try a bold last-minute pivot','Higher uncertainty; the idea may miss the brief','case:final:bold',{energy:-5})]);}
export function caseChoice(s,id){
 if(!id?.startsWith('case:'))return null;
 const [,stage,style]=id.split(':'),r=s.caseRecord,a=s.caseAttempt;
 if(stage==='local'){
  const score=caseReadiness(s)+(style==='evidence'?10:style==='team'?8:-8)+random(s)*45;
  const result=score>=82?'Champion':score>=64?'Podium award':score>=48?'Finalist':'Participant';
  if(['Champion','Podium award'].includes(result)){r.localAwards++;s.flags.award=true;effects(s,{career:6});}if(result==='Champion')r.localChampions++;
  const detail=`${result} · Hong Kong student business case competition (simulated).`;r.history.push({turn:s.turn,date:dateLabel(s),kind:'Local competition',result});s.achievements.push({date:dateLabel(s),title:'Local business case competition · '+result,detail});checkCaseUnlock(s);return `${detail} The result is recorded on your CV.${r.unlocked?' Your international nomination pathway is open.':''}`;
 }
 if(!a||a.turn!==s.turn)return 'This competition is no longer active.';
 if(stage==='select'&&a.status==='application'){
  a.team=style;a.score=selectionScore(s,style);a.priority=casePriority(s);
  if(a.score<a.threshold||caseReadiness(s)<30){a.status='not selected';effects(s,{energy:6,wellbeing:4});r.history.push({turn:s.turn,date:dateLabel(s),kind:'International nomination',result:'Not selected',city:a.city});return `Your team is not selected this semester. ${a.priority}; selection score ${Math.round(a.score)}, competing-team benchmark ${Math.round(a.threshold)}. Two reserved slots return to rest. Your pathway stays open for next semester; no international representation is added to your CV.`;}
  a.status='training';appendNext(s,trainingEvent(s));return `Selected for ${a.city}. ${a.priority} helped your application. Before departure, complete three training weekends. Training, flights, accommodation and entry are fully sponsored by HKU in this simulation.`;
 }
 if(stage==='withdraw'&&a.status==='training'){a.status='withdrawn';r.history.push({turn:s.turn,date:dateLabel(s),kind:'International nomination',result:`Withdrew after ${a.weekends}/3 training weekends`,city:a.city});return 'You withdraw before travelling. There is no completed international competition on your CV. You can form a team again next semester.';}
 if(stage==='train'&&a.status==='training'){
  a.weekends++;a.training+=style==='deep'?6:3;s.skills.consulting+=style==='deep'?4:2;
  if(a.weekends===3){a.status='ready';s.achievements.push({date:dateLabel(s),title:'International case team training',detail:'Completed all three weekends: case research, financial analysis and presentation / Q&A.'});appendNext(s,finalEvent(s));}else appendNext(s,trainingEvent(s));
  return `Training weekend ${a.weekends}/3 completed. ${a.weekends===3?'Your preparation is complete. The sponsored trip is next.':'Your next training weekend is scheduled before departure.'}`;
 }
 if(stage==='final'&&a.status==='ready'&&a.weekends===3){
  const score=caseReadiness(s)+a.training+(style==='evidence'?8:style==='team'?6:-8)+random(s)*(style==='bold'?50:30),result=score>=110?'Champion':score>=92?'Podium award':score>=75?'Finalist':'Participant';
  a.status='completed';a.result=result;r.internationalEntries++;if(['Champion','Podium award'].includes(result))r.internationalAwards++;if(result==='Champion')r.internationalChampions++;
  effects(s,{career:result==='Champion'?14:8,network:10,bonds:5});const detail=`Represented HKU in ${a.city} · ${result}. Three training weekends completed; trip fully sponsored by HKU (simulated).`;
  r.history.push({turn:s.turn,date:dateLabel(s),kind:'International competition',result,city:a.city});s.achievements.push({date:dateLabel(s),title:'International Business Case Invitational · '+result,detail});return `${detail} You can form a team once again next teaching semester.${result==='Champion'?' You now receive the highest nomination priority.':' Future selection still depends on capability and the competing teams.'}`;
 }
 return 'This stage has already been completed.';
}
export const caseReminder=s=>s.caseRecord?.unlocked&&context(s).term&&s.caseRecord.lastApplied!==s.turn&&!s.leaveTerms&&!placementActive(s)?'Optional: your international case pathway is open. Form a team in Case competitions; nomination is competitive each semester.':'';
