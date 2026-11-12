const {open}=require('./lib.cjs');const {cut}=require('./cut.cjs');const fs=require('fs');
async function part(out, opts, fn){const r=await open(opts);const p=r.page;if(opts.pre)await opts.pre(p);await r.start();await fn(r,p);await r.stop('videos-out/tmp.app.mp4');
 const res=cut('videos-out/tmp.app.mp4',[0],'videos-out/tmp');fs.renameSync('videos-out/tmp_parte1.mp4',out);console.log(out,res[0].real,res[0].speed);}
const M={w:390,h:693};
const only=process.argv[2]||'';
(async()=>{
if(!only||only==='intro'){
await part('videos-out/Loomi_cada-uno-ve-lo-suyo_parte1.mp4',{url:'/demo?tab=overview'},async(r,p)=>{await r.wait(1200);
 await r.click(p.getByRole('button',{name:/^Administración/}).first(),{after:900});
 for(const t of ['Gastos y caja','Informes','Cabañas y calendarios','Tarifas']){await r.moveTo(p.getByText(t,{exact:true}).last(),{steps:18});await r.wait(700);}
 await r.click(p.getByText('Informes',{exact:true}).last(),{after:1800});});
await part('videos-out/Loomi_cada-uno-ve-lo-suyo_parte2.mp4',{url:'/recepcion',pre:async p=>{await p.getByRole('button',{name:/Mostrador/}).click();await p.waitForTimeout(800);}},async(r,p)=>{await r.wait(1000);
 for(const t of ['Ingresos hoy','Salidas hoy','En Estancia','Caja Mostrador']){await r.moveTo(p.getByText(t,{exact:true}).first(),{steps:20});await r.wait(800);}
 await r.scroll(700,{steps:40});await r.wait(1500);});
await part('videos-out/Loomi_cada-uno-ve-lo-suyo_parte3.mp4',{url:'/limpieza',...M},async(r,p)=>{await r.wait(1500);
 await r.moveTo(p.getByText('Para Limpiar').first());await r.wait(800);
 await r.scroll(600,{steps:45});await r.wait(1000);await r.scroll(600,{steps:45});await r.wait(1500);});
}
if(!only||only==='recepcion'){
await part('videos-out/Loomi_recepcion_parte1.mp4',{url:'/recepcion'},async(r,p)=>{await r.wait(900);
 await r.click(p.getByRole('button',{name:/Mostrador/}),{after:1000});
 await r.moveTo(p.getByText('Ingresos hoy',{exact:true}).first());await r.wait(900);
 await r.moveTo(p.getByText('Salidas hoy',{exact:true}).first());await r.wait(900);
 await r.scrollTo(p.getByText(/Flujo de Huéspedes/).first(),{block:'start'});await r.wait(1500);});
await part('videos-out/Loomi_recepcion_parte2.mp4',{url:'/recepcion',pre:async p=>{await p.getByRole('button',{name:/Mostrador/}).click();await p.waitForTimeout(700);await p.getByText(/Flujo de Huéspedes/).first().evaluate(e=>e.scrollIntoView({block:'start'}));await p.waitForTimeout(500);}},async(r,p)=>{await r.wait(800);
 await r.click(p.getByRole('button',{name:'Check-in'}).first(),{after:1200});
 await r.moveTo(p.getByText(/Pedir DNI/).first(),{dx:-150});await r.wait(1000);
 await r.click(p.getByRole('button',{name:/Listo, dar el ingreso/}),{after:1300});
 await r.moveTo(p.getByRole('button',{name:/Tarjeta WhatsApp/}).first());await r.wait(1800);});
await part('videos-out/Loomi_recepcion_parte3.mp4',{url:'/recepcion',pre:async p=>{await p.getByRole('button',{name:/Mostrador/}).click();await p.waitForTimeout(700);await p.getByText('Caja Chica & Mostrador').first().evaluate(e=>e.scrollIntoView({block:'start'}));await p.waitForTimeout(500);}},async(r,p)=>{await r.wait(900);
 await r.click(p.getByRole('button',{name:/Cochera/}),{after:1000});
 await r.moveTo(p.getByText('Concepto del Cobro').first());await r.wait(900);
 await r.click(p.getByRole('button',{name:'Confirmar Cobro'}),{after:1500});
 await r.moveTo(p.getByText('Últimos Asientos de Caja:').first());await r.wait(2000);});
}
if(!only||only==='limpieza'){
if(only!=='limp3'){}
await part('videos-out/Loomi_limpieza_parte1.mp4',{url:'/limpieza',...M},async(r,p)=>{await r.wait(1200);
 await r.click(p.getByText('Para Limpiar').first(),{after:1000});
 await r.scrollTo(p.getByText('Cabaña Timbó').first(),{block:'start'});await r.wait(800);
 await r.moveTo(p.getByText(/Llega hoy: Agustina/).first());await r.wait(2000);});
await part('videos-out/Loomi_limpieza_parte2.mp4',{url:'/limpieza',...M,pre:async p=>{await p.getByText('Para Limpiar').first().click();await p.waitForTimeout(500);await p.getByText(/Checklist de 4 Puntos \(1\/4\)/).first().evaluate(e=>e.scrollIntoView({block:'start'}));await p.waitForTimeout(400);}},async(r,p)=>{await r.wait(700);
 for(const t of ['Baño higienizado','Cocina & vajilla','Ventilación & aroma']){await r.click(p.getByText(new RegExp(t)).last(),{after:600});}
 await r.scrollTo(p.getByRole('button',{name:/Marcar Unidad Lista/}).first(),{block:'center',ms:700});
 await r.click(p.getByRole('button',{name:/Marcar Unidad Lista/}).first(),{after:1800});});
await part('videos-out/Loomi_limpieza_parte3.mp4',{url:'/limpieza',...M,pre:async p=>{await p.getByPlaceholder(/falta papel/).last().evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(400);}},async(r,p)=>{await r.wait(600);
 await r.click(p.getByRole('button',{name:'Faltan insumos'}).last(),{after:600});
 await r.click(p.getByPlaceholder(/falta papel/).last(),{after:150});await p.keyboard.press('End');await p.keyboard.type(': detergente y papel',{delay:50});await r.wait(500);
 await r.click(p.getByPlaceholder(/falta papel/).last().locator('xpath=following::button[1]'),{after:900});
 await r.scrollTo(p.getByText('Esta semana').first(),{block:'start',ms:1200});
 await r.scroll(500,{steps:40});await r.wait(1600);});
}
})();
