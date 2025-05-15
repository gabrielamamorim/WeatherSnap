async function buscarCidade(cidade) {
    try {

        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1`;
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("Cidade não encontrada.");

        const dados = await resposta.json();
        const resultado = dados.results?.[0];

        return {
            latitude: resultado.latitude,
            longitude: resultado.longitude,
            cidade: resultado.name,
            pais: resultado.country
        }

    } catch (erro) {
        console.error("Erro ao buscar dados: ", erro.message);
    }
}

async function buscarPrevisao(latitude, longitude) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&hourly=relative_humidity_2m,windspeed_10m&timezone=auto`;

        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("Erro ao obter previsão");

        const dados = await resposta.json();

        const horaISO = new Date().toISOString().slice(0, 13);

        const indiceHoraAtual = dados.hourly.time.findIndex(hora => hora.startsWith(horaISO));

        const umidadeAtual = dados.hourly.relative_humidity_2m[indiceHoraAtual];
        const ventoAtual = dados.hourly.windspeed_10m[indiceHoraAtual];

        return {
            temperaturaAtual: dados.current_weather.temperature,
            climaAtual: dados.current_weather.weathercode,
            previsaoProximosDias: dados.daily.weathercode.slice(1, 4),
            dias: dados.daily.time.slice(1, 4),
            maximas: dados.daily.temperature_2m_max.slice(1, 4),
            umidade: umidadeAtual,
            vento: ventoAtual
        }

    } catch (erro) {
        console.error("Erro ao buscar previsão: ", erro.message);
    }

}

async function atualizarInterface(dados, cidade, pais) {

    const { temperaturaAtual, climaAtual, previsaoProximosDias, dias, maximas, umidade, vento } = dados;

    // data atual
    const dataAtual = formatarData(new Date());
    document.getElementById('data-0').textContent = dataAtual;

    // local
    document.getElementById('local').textContent = `${cidade}, ${pais}`;

    const clima = previsaoProximosDias.map(code => convertendoWeatherCode(code));
    console.log("Condição climática próximos 3 dias: ", clima);

    clima.forEach((dia, index) => {
        const data = new Date(dias[index]);
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' });

        document.getElementById(`icone-dia-${index + 1}`).textContent = dia.icone;
        document.getElementById(`dia-${index + 1}`).textContent = diaSemana;
        document.getElementById(`temperatura-dia-${index + 1}`).textContent = `${Math.round(maximas[index]) + '°C'}`;
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

    // vento atual
    document.getElementById('vento').textContent = vento + ' Km/h';

    // umidade atual
    document.getElementById('umidade').textContent = umidade + '%';

    const horaAtual = new Date().getHours();
    const temaClima = climaParaTema(climaAtual);
    aplicarTema(temaClima, horaAtual);

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

    return codigos[codigo] || { condicao: "Condição desconhecida", icone: "❓", mensagem: "Clima misterioso - esteja preparado para tudo!" };
}

async function buscar() {
    const input = document.getElementById('input-cidade');
    const cidade = input.value.trim();

    if (!cidade) return;

    const coordenadas = await buscarCidade(cidade);
    if (!coordenadas) return;

    const dados = await buscarPrevisao(coordenadas.latitude, coordenadas.longitude);
    if (!dados) return;

    await atualizarInterface(dados, coordenadas.cidade, coordenadas.pais);
}

async function limparInput() {
    document.getElementById('input-cidade').value = '';
}

const sobreposicao = document.getElementById('info-api');

const botaoBuscar = document.getElementById('botao-buscar');
botaoBuscar.addEventListener('click', () => {
    buscar();
    sobreposicao.classList.remove('hidden');
    limparInput();
});

const inputCidade = document.getElementById('input-cidade');
inputCidade.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscar();
        sobreposicao.classList.remove('hidden');
        limparInput();
    }
})

function formatarData(dataString) {
    const data = new Date(dataString);

    const opcoes = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };

    let dataFormatada = data.toLocaleDateString('pt-BR', opcoes);

    // Coloca cada palavra com a primeira letra maiúscula
    dataFormatada = dataFormatada.split(' ').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');

    return dataFormatada;
}

function aplicarTema(clima, horaAtual) {
    const body = document.body;
    body.classList.remove(
        'bg-dia', 'bg-noite',
        'bg-dia-ensolarado', 'bg-dia-nublado', 'bg-dia-chuvoso',
        'bg-noite-nublado', 'bg-noite-chuvoso', 'bg-noite-temporal'
    );

    const isDia = horaAtual >= 6 && horaAtual < 18;

    if (isDia) {
        switch (clima) {
            case 'ensolarado':
                body.classList.add('bg-dia-ensolarado');
                break;
            case 'nublado':
                body.classList.add('bg-dia-nublado');
                break;
            case 'chuvoso':
                body.classList.add('bg-dia-chuvoso');
                break;
            default:
                body.classList.add('bg-dia');
        }
    } else {
        switch (clima) {
            case 'nublado':
                body.classList.add('bg-noite-nublado');
                break;
            case 'chuvoso':
                body.classList.add('bg-noite-chuvoso');
                break;
            case 'temporal':
                body.classList.add('bg-noite-temporal');
                break;
            default:
                body.classList.add('bg-noite');
        }
    }
}

function climaParaTema(codigo) {
    if ([0, 1, 2].includes(codigo)) return 'ensolarado';       // Céu limpo, poucas nuvens, parcialmente nublado -> ensolarado
    if ([3, 45, 48].includes(codigo)) return 'nublado';        // Nublado, névoa -> nublado
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(codigo)) return 'chuvoso'; // chuvisco, chuva, pancadas
    if ([95, 96, 99].includes(codigo)) return 'temporal';      // tempestades
    return 'ensolarado';  // fallback padrão
}