async function buscarCidade(cidade) {
    try {

        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1`;
        const resposta = await fetch(url);
        if(!resposta.ok) throw new Error("Cidade não encontrada.");

        const dados = await resposta.json();
        const resultado = dados.results?.[0];
        
        return {
            latitude: resultado.latitude,
            longitude: resultado.longitude
        }

    } catch (erro) {
        console.error("Erro ao buscar dados: ", erro.message);
    }
}

async function buscarPrevisao(latitude, longitude) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto`;

        const resposta = await fetch(url);
        if(!resposta.ok) throw new Error("Erro ao obter previsão");
        
        const dados = await resposta.json();

        return {
            temperaturaAtual: dados.current_weather.temperature,
            climaAtual: dados.current_weather.weathercode,
            previsaoProximosDias: dados.daily.weathercode.slice(0,3)
        }

    } catch (erro) {
        console.error("Erro ao buscar previsão: ", erro.message);
    }

}

async function atualizarInterface(dados) {

    const {temperaturaAtual, climaAtual, previsaoProximosDias} = dados;

    const clima = previsaoProximosDias.map(code => convertendoWeatherCode(code));
    console.log("Condição climática próximos 3 dias: ", clima);

    clima.forEach((dia, index) => {
        document.getElementById(`icone-dia-${index}`).textContent = dia.icone;
    });

    // clima atual
    const climaAtualConvertido = convertendoWeatherCode(climaAtual);

    // ícone do clima atual
    document.getElementById('icone-clima-atual').textContent = climaAtualConvertido.icone;

    // temperatura atual
    document.getElementById('temperatura-atual').textContent = temperaturaAtual + '°C';

    // mensagem do clima atual
    document.getElementById('mensagem').textContent = climaAtualConvertido.mensagem;
    
    // condicao atual
    document.getElementById('condicao').textContent = climaAtualConvertido.condicao;
    
}

function convertendoWeatherCode(codigo) {
    const codigos = {
        0: { condicao: "Céu limpo", icone: "☀️", mensagem: "Dia ideal para uma caminhada ao ar livre!" },
        1: { condicao: "Poucas nuvens", icone: "🌤️", mensagem: "Perfeito para um passeio no parque." },
        2: { condicao: "Parcialmente nublado", icone: "⛅", mensagem: "Clima agradável para uma leitura ao ar livre." },
        3: { condicao: "Nublado", icone: "☁️", mensagem: "Dia perfeito para um café quente e um bom livro! ☕📚" },
        45: { condicao: "Névoa", icone: "🌫️", mensagem: "Vá devagar, visibilidade reduzida!" },
        48: { condicao: "Névoa com gelo", icone: "🌫️❄️", mensagem: "Atenção ao sair, pode estar escorregadio." },
        51: { condicao: "Chuvisco leve", icone: "🌧️", mensagem: "Leve um guarda-chuva!" },
        53: { condicao: "Chuvisco moderado", icone: "🌧️", mensagem: "Boa desculpa para curtir um filme em casa." },
        55: { condicao: "Chuvisco forte", icone: "🌧️", mensagem: "Capriche na capa de chuva hoje!" },
        61: { condicao: "Chuva leve", icone: "🌦️", mensagem: "Chuvinha boa para relaxar e ouvir música." },
        63: { condicao: "Chuva moderada", icone: "🌧️", mensagem: "Ideal para maratonar sua série favorita!" },
        65: { condicao: "Chuva forte", icone: "🌧️", mensagem: "Fique seco e seguro — evite sair se puder." },
        71: { condicao: "Neve leve", icone: "❄️", mensagem: "Tempo mágico — perfeito para fotos!" },
        73: { condicao: "Neve moderada", icone: "❄️", mensagem: "Aproveite para se aquecer com chocolate quente." },
        75: { condicao: "Neve intensa", icone: "❄️", mensagem: "Ideal para um dia aconchegante em casa." },
        80: { condicao: "Pancadas de chuva leves", icone: "🌧️🌦️", mensagem: "Pode molhar rapidinho — leve um guarda-chuva." },
        81: { condicao: "Pancadas de chuva moderadas", icone: "🌧️🌦️", mensagem: "Ótimo para curtir um livro com som de chuva." },
        82: { condicao: "Pancadas de chuva fortes", icone: "🌧️🌦️", mensagem: "Evite sair sem proteção — vai molhar mesmo!" },
        95: { condicao: "Tempestade", icone: "⛈️", mensagem: "Dia de se proteger e ficar em casa, se possível." },
        96: { condicao: "Tempestade com granizo leve", icone: "⛈️❄️", mensagem: "Atenção ao sair — risco de granizo!" },
        99: { condicao: "Tempestade com granizo forte", icone: "⛈️❄️", mensagem: "Fique em segurança e acompanhe o clima." }
    };

    return codigos[codigo] || {condicao: "Condição desconhecida", icone: "❓", mensagem: "Clima misterioso - esteja preparado para tudo!"};
}

async function buscar() {
    const input = document.getElementById('input-cidade');
    const cidade = input.value.trim();
    
    if(!cidade) return;
    
    const coordenadas = await buscarCidade(cidade);
    if(!coordenadas) return;
    
    const dados = await buscarPrevisao(coordenadas.latitude, coordenadas.longitude);
    if(!dados) return;
    
    await atualizarInterface(dados);
}

const botaoBuscar = document.getElementById('botao-buscar');
botaoBuscar.addEventListener('click', buscar);

const inputCidade = document.getElementById('input-cidade');
inputCidade.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        buscar();
    }
})