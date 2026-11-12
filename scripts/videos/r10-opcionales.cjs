const {open}=require('./lib.cjs');const {cut}=require('./cut.cjs');
(async()=>{const r=await open({url:'/demo?tab=addons'});const p=r.page;
await r.start(); await r.wait(1000);
for (const t of ['Desayunos y comidas','Traslados','Excursiones y experiencias','Otros servicios']) { await r.moveTo(p.getByText(t,{exact:true}).first(),{steps:24}); await r.wait(1300); }
r.mark('b');
await r.click(p.getByRole('button',{name:'Categorías'}),{after:900});
await r.type(p.getByPlaceholder('Categoría nueva'),'Spa y masajes',{delay:50});
await r.click(p.getByRole('button',{name:'Sumar'}),{after:800});
await r.click(p.getByRole('button',{name:'Guardar'}).last(),{after:1200});
r.mark('c');
await r.click(p.getByRole('button',{name:'Nuevo opcional'}),{after:800});
await r.type(p.getByPlaceholder(/Desayuno de campo/),'Masaje relajante',{delay:35});
const sel=p.locator('select').filter({hasText:'Desayunos y comidas'}).last();
await r.moveTo(sel);await sel.selectOption({label:'Spa y masajes'},{timeout:2000}).catch(e=>console.log('sel',e.message.slice(0,60)));await r.wait(400);
await r.type(p.locator('input[type=number]').last(),'45',{delay:120});
await r.click(p.getByRole('button',{name:'Crear opcional'}),{after:1500});
await r.moveTo(p.getByText('Masaje relajante').first());await r.wait(900);
const m=await r.stop('videos-out/r10.app.mp4');console.log(m);
console.log(JSON.stringify(cut('videos-out/r10.app.mp4',[0,m.b,m.c],'videos-out/Loomi_opcionales-y-extras')));})();
