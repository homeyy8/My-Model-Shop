let SUPA = null;
let SUPABASE_INIT_ERROR = null;

try {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('โหลด Supabase ไม่สำเร็จ กรุณารีเฟรชหน้า หรือเปิดอินเทอร์เน็ต แล้วลองใหม่');
  }
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    throw new Error('ยังไม่ได้ตั้งค่า Supabase ใน config.js');
  }
  SUPA = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} catch (e) {
  SUPABASE_INIT_ERROR = e;
  console.error('Supabase initialization failed:', e);
}
const OLD_KEY = "my_model_shop_products_v1";
let galleryProduct = null;
let galleryIndex = 0;
let pendingFiles = [];

function money(v){return Number(v||0).toLocaleString('th-TH')}
function catName(c){return c==='toy-gun'?'ปืนของเล่น':'โมเดลสัตว์'}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function normalizeProduct(p){return {...p,oldprice:+p.oldprice||0,price:+p.price||0,stock:+p.stock||0,images:Array.isArray(p.images)?p.images:[]}}

async function getProducts({admin=false}={}){
  let q=SUPA.from('products').select('*').order('created_at',{ascending:false});
  if(!admin) q=q.eq('active',true);
  const {data,error}=await q;
  if(error) throw error;
  return (data||[]).map(normalizeProduct);
}

async function uploadImage(file, productId){
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
  const path=`${productId}/${crypto.randomUUID()}.${ext}`;
  const {error}=await SUPA.storage.from('product-images').upload(path,file,{cacheControl:'31536000',upsert:false,contentType:file.type||'image/jpeg'});
  if(error) throw error;
  const {data}=SUPA.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

async function compressFile(file,max=1400,quality=.82){
  return new Promise((resolve,reject)=>{
    const img=new Image(); const url=URL.createObjectURL(file);
    img.onload=()=>{URL.revokeObjectURL(url);let w=img.naturalWidth,h=img.naturalHeight;const s=Math.min(1,max/Math.max(w,h));w=Math.max(1,Math.round(w*s));h=Math.max(1,Math.round(h*s));const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);c.toBlob(b=>b?resolve(new File([b],file.name.replace(/\.[^.]+$/i,'.jpg'),{type:'image/jpeg'})):reject(new Error('แปลงรูปไม่สำเร็จ')),'image/jpeg',quality)};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('อ่านรูปไม่สำเร็จ'))}; img.src=url;
  });
}

async function renderStore(cat='all'){
  const root=document.getElementById('products'); if(!root)return;
  root.innerHTML='<div class="loading">กำลังโหลดสินค้า...</div>';
  try{
    const ps=await getProducts(); const list=cat==='all'?ps:ps.filter(p=>p.cat===cat);
    document.getElementById('countText').textContent=`พบ ${list.length} รายการ`;
    root.innerHTML=list.map(p=>{const im=p.images?.[0]||'';return `<article class="card"><div class="pic" ${im?`onclick="openGallery('${esc(p.id)}')"`:''}>${im?`<img src="${im}" alt="${esc(p.name)}">`:`<div class="no-image">ไม่มีรูป</div>`}${p.images?.length>1?`<span class="image-count">${p.images.length} รูป</span>`:''}</div><div class="card-body"><span class="tag">${catName(p.cat)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description||p.desc||'')}</p><div class="price">฿${money(p.price)} ${p.oldprice>p.price?`<del>฿${money(p.oldprice)}</del>`:''}</div><div class="stock">${p.stock>0?`มีสินค้า ${p.stock} ชิ้น`:'สินค้าหมด'}</div></div></article>`}).join('')||'<div class="empty">ยังไม่มีสินค้าในหมวดนี้</div>';
  }catch(e){root.innerHTML=`<div class="empty">โหลดสินค้าไม่สำเร็จ: ${esc(e.message)}</div>`}
}

async function openGallery(id){try{const ps=await getProducts();galleryProduct=ps.find(p=>p.id===id);galleryIndex=0;if(!galleryProduct)return;document.getElementById('imagePopup').classList.add('show');renderGallery()}catch(e){alert('เปิดรูปไม่สำเร็จ: '+e.message)}}
function renderGallery(){const p=galleryProduct;if(!p)return;const ims=p.images||[];document.getElementById('galleryMain').src=ims[galleryIndex]||'';document.getElementById('galleryInfo').textContent=`${galleryIndex+1} / ${ims.length}`;document.getElementById('galleryThumbs').innerHTML=ims.map((im,i)=>`<img class="gallery-thumb ${i===galleryIndex?'active':''}" src="${im}" onclick="galleryIndex=${i};renderGallery()">`).join('')}
function galleryPrev(){if(!galleryProduct?.images?.length)return;galleryIndex=(galleryIndex-1+galleryProduct.images.length)%galleryProduct.images.length;renderGallery()}
function galleryNext(){if(!galleryProduct?.images?.length)return;galleryIndex=(galleryIndex+1)%galleryProduct.images.length;renderGallery()}
function closeGallery(){document.getElementById('imagePopup')?.classList.remove('show')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGallery();if(document.getElementById('imagePopup')?.classList.contains('show')){if(e.key==='ArrowLeft')galleryPrev();if(e.key==='ArrowRight')galleryNext()}});

async function requireUser(){const {data}=await SUPA.auth.getUser();return data.user}
async function adminInit(){
  const login=document.getElementById('loginBox'),dash=document.getElementById('adminDashboard'),msg=document.getElementById('loginMsg');
  try{
    if(SUPABASE_INIT_ERROR || !SUPA) throw (SUPABASE_INIT_ERROR || new Error('Supabase ยังไม่พร้อมใช้งาน'));
    const user=await requireUser();
    if(!user){login.style.display='block';dash.style.display='none';return}
    login.style.display='none';
    dash.style.display='block';
    document.getElementById('adminEmail').textContent=user.email||'';
    await renderAdmin();
  }catch(e){
    console.error('adminInit error:',e);
    if(login) login.style.display='block';
    if(dash) dash.style.display='none';
    if(msg) msg.textContent='เชื่อมต่อระบบไม่สำเร็จ: '+(e?.message||e);
  }
}
async function loginAdmin(){
  const msg=document.getElementById('loginMsg');
  try{
    if(SUPABASE_INIT_ERROR || !SUPA) throw (SUPABASE_INIT_ERROR || new Error('Supabase ยังไม่พร้อมใช้งาน'));
    const email=document.getElementById('loginEmail').value.trim();
    const password=document.getElementById('loginPassword').value;
    if(!email || !password){msg.textContent='กรุณากรอกอีเมลและรหัสผ่าน';return}
    msg.textContent='กำลังเข้าสู่ระบบ...';
    const {error}=await SUPA.auth.signInWithPassword({email,password});
    if(error){console.error('Login error:',error);msg.textContent='เข้าสู่ระบบไม่สำเร็จ: '+error.message;return}
    msg.textContent='เข้าสู่ระบบสำเร็จ กำลังเปิดหน้าจัดการสินค้า...';
    await adminInit();
  }catch(e){
    console.error('loginAdmin error:',e);
    msg.textContent='เกิดข้อผิดพลาด: '+(e?.message||e);
  }
}
async function logoutAdmin(){await SUPA.auth.signOut();location.reload()}

async function renderAdmin(){
 const ps=await getProducts({admin:true});
 document.getElementById('stats').innerHTML=`<div class="stat"><b>${ps.length}</b><span>สินค้าทั้งหมด</span></div><div class="stat"><b>${ps.filter(p=>p.cat==='toy-gun').length}</b><span>ปืนของเล่น</span></div><div class="stat"><b>${ps.filter(p=>p.cat==='animal').length}</b><span>โมเดลสัตว์</span></div><div class="stat"><b>${ps.filter(p=>p.active).length}</b><span>แสดงหน้าร้าน</span></div>`;
 const q=(document.getElementById('search')?.value||'').toLowerCase(),c=document.getElementById('catFilter')?.value||'all';
 const list=ps.filter(p=>(!q||p.name.toLowerCase().includes(q))&&(c==='all'||p.cat===c));
 document.getElementById('table').innerHTML=list.map(p=>`<tr><td><div class="prod-mini">${p.images?.[0]?`<img class="thumb" src="${p.images[0]}">`:`<div class="thumb"></div>`}<b>${esc(p.name)}</b></div></td><td>${catName(p.cat)}</td><td><b>฿${money(p.price)}</b>${p.oldprice>p.price?`<br><small class="old">฿${money(p.oldprice)}</small>`:''}</td><td>${p.stock}</td><td><span class="status ${p.active?'':'off'}">${p.active?'แสดง':'ซ่อน'}</span></td><td><div class="actions"><button class="secondary" onclick="editProduct('${esc(p.id)}')">แก้ไข</button><button class="danger" onclick="deleteProduct('${esc(p.id)}')">ลบ</button></div></td></tr>`).join('')||'<tr><td colspan="6">ยังไม่มีสินค้า</td></tr>';
}
document.addEventListener('input',e=>{if(e.target.id==='search'||e.target.id==='catFilter')renderAdmin().catch(console.error)});

async function openForm(id=''){
 pendingFiles=[];document.getElementById('modal').classList.add('show');document.getElementById('productForm').reset();document.getElementById('pid').value=id;document.getElementById('preview').innerHTML='';document.getElementById('pendingPreview').innerHTML='';
 if(id){const ps=await getProducts({admin:true}),p=ps.find(x=>x.id===id);if(!p)return;document.getElementById('formTitle').textContent='แก้ไขสินค้า';pname.value=p.name;pcat.value=p.cat;price.value=p.price;oldprice.value=p.oldprice||'';stock.value=p.stock;desc.value=p.description||'';active.checked=p.active;document.getElementById('preview').innerHTML=(p.images||[]).map((im,i)=>`<div class="preview-item"><img src="${im}"><button type="button" class="danger" onclick="removeExistingImage(${JSON.stringify(p.id)},${i})">ลบรูป</button></div>`).join('')}
 else document.getElementById('formTitle').textContent='เพิ่มสินค้า';
}
function closeForm(){document.getElementById('modal').classList.remove('show');pendingFiles=[]}
function editProduct(id){openForm(id).catch(e=>alert(e.message))}

document.getElementById('image')?.addEventListener('change',e=>{pendingFiles=[...e.target.files];document.getElementById('pendingPreview').innerHTML=pendingFiles.map((f,i)=>`<div class="preview-item pending-preview"><img src="${URL.createObjectURL(f)}"><small>${esc(f.name)}</small></div>`).join('')})

document.getElementById('productForm')?.addEventListener('submit',async e=>{
 e.preventDefault();const btn=e.currentTarget.querySelector('button.primary');btn.disabled=true;btn.textContent='กำลังบันทึก...';
 try{const id=document.getElementById('pid').value||crypto.randomUUID();const ps=await getProducts({admin:true});const old=ps.find(x=>x.id===id);let images=[...(old?.images||[])];for(const file of pendingFiles){images.push(await uploadImage(await compressFile(file),id))}
 const obj={id,name:pname.value.trim(),cat:pcat.value,price:+price.value||0,oldprice:+oldprice.value||0,stock:+stock.value||0,description:desc.value.trim(),images,active:active.checked};if(!obj.name)throw new Error('กรุณากรอกชื่อสินค้า');
 const {error}=await SUPA.from('products').upsert(obj,{onConflict:'id'});if(error)throw error;closeForm();await renderAdmin();alert('บันทึกสินค้าเรียบร้อยแล้ว')}
 catch(err){console.error(err);alert('บันทึกไม่สำเร็จ: '+err.message)}finally{btn.disabled=false;btn.textContent='บันทึกสินค้า'}});

async function removeExistingImage(id,i){const ps=await getProducts({admin:true}),p=ps.find(x=>x.id===id);if(!p)return;p.images.splice(i,1);const {error}=await SUPA.from('products').update({images:p.images}).eq('id',id);if(error){alert(error.message);return}openForm(id)}
async function deleteProduct(id){const ps=await getProducts({admin:true}),p=ps.find(x=>x.id===id);if(!p||!confirm(`ลบสินค้า "${p.name}" ใช่หรือไม่?`))return;const {error}=await SUPA.from('products').delete().eq('id',id);if(error){alert(error.message);return}await renderAdmin()}

async function migrateLocal(){
 const raw=localStorage.getItem(OLD_KEY);if(!raw){alert('ไม่พบข้อมูลสินค้าเดิมในเบราว์เซอร์นี้');return}let old;try{old=JSON.parse(raw)}catch(e){alert('ข้อมูลเดิมอ่านไม่ได้');return}if(!confirm(`พบสินค้าเดิม ${old.length} รายการ ต้องการย้ายขึ้นระบบออนไลน์หรือไม่?`))return;
 let done=0;for(const p0 of old){const p=normalizeProduct(p0),id=p.id||crypto.randomUUID(),images=[];for(const dataUrl of p.images||[]){try{const blob=await (await fetch(dataUrl)).blob();const file=new File([blob],`legacy-${Date.now()}.jpg`,{type:blob.type||'image/jpeg'});images.push(await uploadImage(await compressFile(file),id))}catch(e){console.warn('ข้ามรูป',e)}}const row={id,name:p.name,cat:p.cat,price:p.price,oldprice:p.oldprice,stock:p.stock,description:p.desc||'',images,active:p.active!==false};const {error}=await SUPA.from('products').upsert(row,{onConflict:'id'});if(error)throw error;done++}alert(`ย้ายข้อมูลสำเร็จ ${done} รายการ`);await renderAdmin();
}
