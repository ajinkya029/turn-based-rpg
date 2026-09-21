import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Sword, Shield, Heart, Sparkles, Flame, Zap, RotateCcw, Trophy, Backpack, ScrollText} from 'lucide-react';
import './styles.css';

const enemies = [
 {name:'Ember Wolf',level:1,hp:78,maxHp:78,attack:13,def:3,emoji:'🐺',desc:'A swift predator wreathed in sparks.',reward:35},
 {name:'Moss Golem',level:2,hp:115,maxHp:115,attack:17,def:6,emoji:'🗿',desc:'Ancient stone animated by forest magic.',reward:55},
 {name:'Void Warden',level:3,hp:155,maxHp:155,attack:22,def:8,emoji:'👹',desc:'A guardian forged from shadow and silence.',reward:90}
];

const initialPlayer = {name:'Astra',level:1,xp:0,nextXp:100,hp:120,maxHp:120,mana:50,maxMana:50,attack:21,def:7,potions:3,ether:2,gold:80};

function App(){
 const [player,setPlayer]=useState(initialPlayer);
 const [enemyIndex,setEnemyIndex]=useState(0);
 const [enemy,setEnemy]=useState({...enemies[0]});
 const [turn,setTurn]=useState('player');
 const [log,setLog]=useState(['Astra enters the forgotten ruins.','A hostile presence approaches...']);
 const [guarding,setGuarding]=useState(false);
 const [victory,setVictory]=useState(0);
 const [gameOver,setGameOver]=useState(false);
 const [screen,setScreen]=useState('battle');

 const addLog=(msg)=>setLog(l=>[...l.slice(-7),msg]);
 const bar=(v,max)=>Math.max(0,Math.min(100,v/max*100));
 const gainXp=(amount)=>{
   setPlayer(p=>{let xp=p.xp+amount, level=p.level, next=p.nextXp, attack=p.attack, def=p.def, maxHp=p.maxHp;
    while(xp>=next){xp-=next;level++;next=Math.floor(next*1.35);maxHp+=18;attack+=4;def+=2;addLog(`✨ Level up! Astra reached level ${level}.`)}
    return {...p,xp,nextXp:next,level,maxHp,hp:maxHp,attack,def};
   });
 };
 const enemyTurn=(currentEnemy, currentPlayer, wasGuarding)=>{
   const raw=Math.max(1,currentEnemy.attack-currentPlayer.def+Math.floor(Math.random()*7)-2);
   const damage=wasGuarding?Math.ceil(raw*.45):raw;
   const hp=currentPlayer.hp-damage;
   addLog(`${currentEnemy.emoji} ${currentEnemy.name} hits for ${damage} damage.`);
   setPlayer(p=>({...p,hp:Math.max(0,hp)}));
   setGuarding(false);
   if(hp<=0){setGameOver(true);addLog('💀 Astra has fallen. The ruins claim another soul.');}
   else setTurn('player');
 };
 const act=(type)=>{
   if(turn!=='player'||gameOver)return;
   if(type==='attack'){
     const damage=Math.max(1,player.attack-enemy.def+Math.floor(Math.random()*10));
     const hp=enemy.hp-damage;
     addLog(`⚔️ Astra strikes ${enemy.name} for ${damage} damage.`);
     if(hp<=0){
       addLog(`🏆 ${enemy.name} defeated! +${enemy.reward} gold, +${enemy.reward} XP.`);
       setPlayer(p=>({...p,gold:p.gold+enemy.reward}));
       gainXp(enemy.reward); setVictory(v=>v+1);
       if(enemyIndex===enemies.length-1){setGameOver(true);addLog('🎉 The Void Warden falls. You saved the realm!');}
       else {const next=enemyIndex+1;setEnemyIndex(next);setEnemy({...enemies[next]});setTurn('player');}
     } else {setEnemy(e=>({...e,hp}));setTurn('enemy');setTimeout(()=>enemyTurn({...enemy,hp},player,guarding),450);}
   }
   if(type==='skill'){
     if(player.mana<18){addLog('Not enough mana.');return;}
     const damage=player.attack+18+Math.floor(Math.random()*12);
     const hp=enemy.hp-damage;
     setPlayer(p=>({...p,mana:p.mana-18}));
     addLog(`🔥 Arcane Burst deals ${damage} damage!`);
     if(hp<=0){addLog(`🏆 ${enemy.name} defeated!`);setPlayer(p=>({...p,gold:p.gold+enemy.reward}));gainXp(enemy.reward);setVictory(v=>v+1);
       if(enemyIndex===enemies.length-1){setGameOver(true);addLog('🎉 The realm is safe!')}
       else {const next=enemyIndex+1;setEnemyIndex(next);setEnemy({...enemies[next]});setTurn('player');}
     } else {setEnemy(e=>({...e,hp}));setTurn('enemy');setTimeout(()=>enemyTurn({...enemy,hp},player,guarding),450);}
   }
   if(type==='guard'){setGuarding(true);addLog('🛡️ Astra braces for impact. Damage is reduced.');setTurn('enemy');setTimeout(()=>enemyTurn(enemy,player,true),450);}
   if(type==='potion'){
     if(player.potions<=0){addLog('No healing potions left.');return;}
     setPlayer(p=>({...p,potions:p.potions-1,hp:Math.min(p.maxHp,p.hp+45)}));addLog('❤️ Astra drinks a potion and restores health.');setTurn('enemy');setTimeout(()=>enemyTurn(enemy,player,guarding),450);
   }
   if(type==='ether'){
     if(player.ether<=0){addLog('No ether left.');return;}
     setPlayer(p=>({...p,ether:p.ether-1,mana:Math.min(p.maxMana,p.mana+30)}));addLog('✨ Mana restored.');setTurn('enemy');setTimeout(()=>enemyTurn(enemy,player,guarding),450);
   }
 };
 const restart=()=>{setPlayer(initialPlayer);setEnemyIndex(0);setEnemy({...enemies[0]});setTurn('player');setLog(['Astra enters the forgotten ruins.','A hostile presence approaches...']);setGameOver(false);setVictory(0);setGuarding(false);setScreen('battle')};
 return <div className="app">
  <header><div className="brand"><Sparkles/> <span>ASTRAL RUINS</span></div><div className="header-meta"><span>✦ Chapter I: The Awakening</span><span className="gold">◈ {player.gold} GOLD</span></div></header>
  <main>
   <aside className="sidebar">
    <div className="hero-card"><div className="avatar">🧙‍♀️</div><h2>{player.name}</h2><p className="muted">Arcane Wanderer</p><div className="level">LEVEL {player.level}</div>
     <label>Experience <b>{player.xp}/{player.nextXp}</b></label><div className="meter xp"><i style={{width:bar(player.xp,player.nextXp)+'%'}}/></div>
     <div className="stat"><Heart/> <div><label>Health</label><div className="meter"><i style={{width:bar(player.hp,player.maxHp)+'%'}}/></div><small>{player.hp} / {player.maxHp}</small></div></div>
     <div className="stat"><Zap/> <div><label>Mana</label><div className="meter mana"><i style={{width:bar(player.mana,player.maxMana)+'%'}}/></div><small>{player.mana} / {player.maxMana}</small></div></div>
     <div className="attributes"><span><Sword/> ATK <b>{player.attack}</b></span><span><Shield/> DEF <b>{player.def}</b></span></div>
    </div>
    <nav><button className={screen==='battle'?'active':''} onClick={()=>setScreen('battle')}><Sword/> Battle</button><button className={screen==='inventory'?'active':''} onClick={()=>setScreen('inventory')}><Backpack/> Inventory</button><button className={screen==='journal'?'active':''} onClick={()=>setScreen('journal')}><ScrollText/> Quest Journal</button></nav>
    <div className="progress"><span>RUINS CLEARED</span><b>{victory} / 3</b><div className="meter"><i style={{width:(victory/3*100)+'%'}}/></div></div>
   </aside>
   <section className="content">
    {screen==='battle'&&<><div className="location"><span>THE FORGOTTEN RUINS</span><span>☼ TURN {victory+1} <em className={turn}>{turn==='player'?'YOUR TURN':'ENEMY TURN'}</em></span></div>
    <div className="arena">
      <div className="scene"><div className="moon">☾</div><div className="enemy-art">{enemy.emoji}</div><div className="enemy-name"><h1>{enemy.name}</h1><p>Level {enemy.level} · {enemy.desc}</p><div className="enemy-hp"><span>HP</span><div className="meter"><i style={{width:bar(enemy.hp,enemy.maxHp)+'%'}}/></div><b>{enemy.hp} / {enemy.maxHp}</b></div></div></div>
      <div className="combat-panel"><div className="turn-banner">{gameOver?(victory===3?'✦ VICTORY ACHIEVED ✦':'☠ DEFEATED'):`${turn==='player'?'YOUR TURN':'ENEMY TURN'} — ${turn==='player'?'Choose an action':'The enemy is preparing to strike...'}`}</div>
       <div className="actions"><button disabled={turn!=='player'||gameOver} onClick={()=>act('attack')}><Sword/><b>Attack</b><small>Basic strike</small></button><button disabled={turn!=='player'||gameOver||player.mana<18} onClick={()=>act('skill')}><Flame/><b>Arcane Burst</b><small>18 mana</small></button><button disabled={turn!=='player'||gameOver} onClick={()=>act('guard')}><Shield/><b>Guard</b><small>Reduce damage</small></button><button disabled={turn!=='player'||gameOver||player.potions<1} onClick={()=>act('potion')}><Heart/><b>Potion</b><small>{player.potions} remaining</small></button><button disabled={turn!=='player'||gameOver||player.ether<1} onClick={()=>act('ether')}><Zap/><b>Ether</b><small>{player.ether} remaining</small></button></div>
       {gameOver&&<button className="restart" onClick={restart}><RotateCcw/> {victory===3?'Play Again':'Try Again'}</button>}
      </div>
    </div>
    <div className="battle-log"><h3><ScrollText/> COMBAT LOG</h3>{log.map((l,i)=><p key={i}>{l}</p>)}</div></>}
    {screen==='inventory'&&<div className="page"><h1>Inventory</h1><div className="items"><div>❤️ <b>Healing Potion</b><span>x {player.potions}</span><p>Restores 45 health.</p></div><div>✨ <b>Ether</b><span>x {player.ether}</span><p>Restores 30 mana.</p></div><div>🪙 <b>Gold</b><span>{player.gold}</span><p>Rewards from defeated enemies.</p></div></div></div>}
    {screen==='journal'&&<div className="page"><h1>Quest Journal</h1><div className="quest"><Trophy/><div><h2>The Forgotten Ruins</h2><p>Defeat the creatures guarding the ancient ruins and confront the Void Warden.</p><b>{victory===3?'Completed':'In progress'} · {victory}/3 victories</b></div></div></div>}
   </section>
  </main>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);