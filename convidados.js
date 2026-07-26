const TABLE='confirmacoes_inauguracao';
function send(res,status,data){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));}
function env(){const url=process.env.SUPABASE_URL||'https://cpnvkjmpmcidyddkdztp.supabase.co';const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;if(!url||!key)throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.');return{url,key};}
async function supa(path,options={}){const {url,key}=env();return fetch(`${url}/rest/v1/${path}`,{...options,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(options.headers||{})}});}
module.exports=async(req,res)=>{try{
  if(req.method==='POST'){
    const nome=String(req.body?.nome||'').trim().slice(0,100);const telefone=String(req.body?.telefone||'').replace(/\D/g,'').slice(0,11);const observacoes=String(req.body?.observacoes||'').trim().slice(0,300);
    if(nome.length<3||telefone.length<10)return send(res,400,{error:'Nome ou telefone inválido.'});
    let check=await supa(`${TABLE}?telefone=eq.${encodeURIComponent(telefone)}&select=id&limit=1`);if(!check.ok)throw new Error(await check.text());const exists=await check.json();if(exists.length)return send(res,409,{error:'Este telefone já confirmou presença.'});
    const r=await supa(TABLE,{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({nome,telefone,observacoes,presente:true,acompanhantes:0})});if(!r.ok)throw new Error(await r.text());const rows=await r.json();return send(res,201,{ok:true,convidado:rows[0]});
  }
  if(req.method==='GET'){
    if(String(req.headers['x-painel-senha']||'')!==(process.env.PAINEL_SENHA||'2858'))return send(res,401,{error:'Senha incorreta.'});
    const r=await supa(`${TABLE}?select=id,nome,telefone,observacoes,criado_em&order=criado_em.desc`);if(!r.ok)throw new Error(await r.text());return send(res,200,{convidados:await r.json()});
  }
  res.setHeader('Allow','GET, POST');return send(res,405,{error:'Método não permitido.'});
}catch(e){console.error(e);return send(res,500,{error:'Erro interno. Verifique as variáveis da Vercel e o banco SQL.'});}};
