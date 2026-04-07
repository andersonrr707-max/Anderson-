let nomeUsuario = "";
let corUsuario = "#ff0000";
let userId = Date.now();
const map = L.map('map').setView([-23.5505, -46.6333], 13);

L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Esri Satellite' }
).addTo(map);

let marcadores = {};
let meusPontos = {};
let meuMarcador = null;

// ===============================
// 🔐 FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyDy08P4e7kxa2YXl4xdZ8dmPc9Znt1BiHg",
  authDomain: "caca-f459d.firebaseapp.com",
  databaseURL: "https://caca-f459d-default-rtdb.firebaseio.com/",
  projectId: "caca-f459d",
  storageBucket: "caca-f459d.firebasestorage.app",
  messagingSenderId: "985974010741",
  appId: "1:985974010741:web:1eec3826411572e587d93c",
  measurementId: "G-7BH7JJP91Y"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===============================
// 👥 ENTRAR
// ===============================
function entrar() {
    nomeUsuario = document.getElementById("nomeInput").value.trim();
    corUsuario = document.getElementById("corInput").value;
    if(!nomeUsuario){ alert("Digite seu nome!"); return; }

    document.getElementById("loginScreen").style.display = "none";
    iniciarGPS();
    ouvirUsuarios();
    map.on('click', adicionarPonto);
}

// ===============================
// 📡 GPS
// ===============================
function iniciarGPS() {
    if(!navigator.geolocation){ alert("GPS não suportado"); return; }

    navigator.geolocation.watchPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if(!meuMarcador){
            meuMarcador = criarMarcador(lat,lng,nomeUsuario,corUsuario,true);
            map.setView([lat,lng],16);
        } else {
            atualizarMarcador(meuMarcador,lat,lng);
        }

        db.ref("usuarios/"+userId).set({ nome: nomeUsuario, lat, lng, cor: corUsuario });

    }, err => console.log("Erro GPS:", err), { enableHighAccuracy:true, maximumAge:0, timeout:5000 });
}

// ===============================
// 👥 Multiplayer
// ===============================
function ouvirUsuarios() {
    db.ref("usuarios").on("value", snapshot=>{
        const dados = snapshot.val()||{};

        // Remove usuários antigos
        for(let id in marcadores){
            if(!dados[id]){
                map.removeLayer(marcadores[id]);
                delete marcadores[id];
            }
        }

        for(let id in dados){
            const user = dados[id];
            if(id==userId) continue;

            if(!marcadores[id]){
                marcadores[id] = criarMarcador(user.lat,user.lng,user.nome,user.cor,false);
            } else {
                atualizarMarcador(marcadores[id],user.lat,user.lng);
            }
        }
    });

    // Remove usuário ao fechar
    window.addEventListener("beforeunload",()=> sair());
}

// ===============================
// 🔧 Marcadores
// ===============================
function criarMarcador(lat,lng,nome,cor,isMe){
    const iconHtml = `<div style="background-color:${cor};border-radius:50%;width:30px;height:30px;text-align:center;color:white;font-weight:bold;">👤</div>`;
    const marker = L.marker([lat,lng], { icon: L.divIcon({ html: iconHtml, className:'' }) }).addTo(map);
    marker.bindTooltip(nome,{permanent:true,direction:'top',className:'user-label'});
    return marker;
}

function atualizarMarcador(marker,lat,lng){ marker.setLatLng([lat,lng]); }

// ===============================
// 📍 Pontos no mapa
// ===============================
function adicionarPonto(e){
    const latlng = e.latlng;
    const pointId = Date.now();

    const marker = L.marker(latlng, {
        icon:L.divIcon({ html:`<div style="background-color:red;border-radius:50%;width:20px;height:20px;text-align:center;color:white;font-weight:bold;">X</div>`, className:'' }),
        draggable:true
    }).addTo(map);

    const comentario = prompt("Digite seu comentário:");
    if(comentario){
        marker.bindTooltip(comentario,{permanent:true,direction:'top',className:'user-label'}).openTooltip();
        marker.comentario = comentario;
    }

    marker.on('click',()=>{
        const novo = prompt("Editar comentário:", marker.comentario||"");
        if(novo===null) return;
        if(novo==="") { map.removeLayer(marker); delete meusPontos[pointId]; return; }
        marker.comentario = novo;
        marker.setTooltipContent(novo);
    });

    meusPontos[pointId] = marker;
}

// ===============================
// 🔎 Busca
// ===============================
function buscarUsuario(){
    const nomeBusca = document.getElementById("searchInput").value.trim().toLowerCase();
    if(!nomeBusca) return;

    for(let id in marcadores){
        const marker = marcadores[id];
        if(marker.getTooltip().getContent().toLowerCase().includes(nomeBusca)){
            map.setView(marker.getLatLng(),17);
            marker.openTooltip();
        }
    }
}

// ===============================
// 🗺 Botões flutuantes
// ===============================
function centralizar(){
    if(meuMarcador) map.setView(meuMarcador.getLatLng(),16);
}

function sair(){
    if(meuMarcador) map.removeLayer(meuMarcador);
    for(let id in meusPontos) map.removeLayer(meusPontos[id]);
    db.ref("usuarios/"+userId).remove();
    meusPontos={};
    location.reload();
}