const {open}=require('./lib.cjs');const {cut}=require('./cut.cjs');
(async()=>{const r=await open({url:'/demo?tab=finances'});const p=r.page;
await r.start(); await r.wait(1500);
for (const t of ['Ocupación','Ingresos por canal','Por unidad','Cobros y saldos']) { await r.moveTo(p.getByText(t,{exact:true}).first(),{steps:22}); await r.wait(700); }
await r.moveTo(p.getByText('Resultado del mes',{exact:true}).first());await r.wait(500);
r.mark('b');
await r.click(p.getByText('Ver informe').first(),{after:1500});
await r.scroll(450,{steps:40});await r.wait(1500);
await r.scroll(450,{steps:40});await r.wait(1200);
r.mark('c');
await r.scroll(-900,{steps:40});await r.wait(500);
await r.moveTo(p.getByRole('button',{name:/Copiar resumen/}).first());await r.wait(1500);
await r.moveTo(p.getByRole('button',{name:/CSV/}).first());await r.wait(1500);
await r.moveTo(p.getByRole('button',{name:/PDF/}).first());await r.wait(2500);
const m=await r.stop('videos-out/r05.app.mp4');console.log(m);
console.log(cut('videos-out/r05.app.mp4',[0,m.b,m.c],'videos-out/Loomi_informes'));})();
