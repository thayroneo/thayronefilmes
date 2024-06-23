const API_KEY = '4851eb0f582baa2561563903376c6824';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const PLAYER_BASE_URL = 'https://vidsrc.xyz/embed/movie?tmdb=';

const searchInput = document.getElementById('movie-title');
const suggestionsContainer = document.getElementById('movie-suggestions');
const movieDetailsContainer = document.getElementById('movie-details');
const moviePosterContainer = document.getElementById('movie-poster');
const movieInfoContainer = document.getElementById('movie-info');

searchInput.addEventListener('input', async function() {
    const query = this.value.trim();
    if (query.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${query}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar filmes');
        }
        const data = await response.json();
        const movies = data.results.slice(0, 5); // Pegar os 5 primeiros resultados

        if (movies.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        suggestionsContainer.innerHTML = ''; // Limpar sugestões anteriores
        movies.forEach(movie => {
            const option = document.createElement('div');
            option.classList.add('suggestion');
            option.textContent = movie.title;
            option.addEventListener('click', () => {
                selectMovie(movie.id);
                suggestionsContainer.style.display = 'none';
            });
            suggestionsContainer.appendChild(option);
        });

        suggestionsContainer.style.display = 'block';
    } catch (error) {
        console.error('Erro na busca de filmes:', error);
    }
});

async function selectMovie(movieId) {
    try {
        const response = await fetch(`${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits`);
        if (!response.ok) {
            throw new Error('Erro ao buscar detalhes do filme');
        }
        const movieData = await response.json();
        displayMovieDetails(movieData);
    } catch (error) {
        console.error('Erro na busca de detalhes do filme:', error);
    }
}

function displayMovieDetails(movie) {
    // Exibindo o poster do filme
    const posterUrl = `${IMAGE_BASE_URL}${movie.poster_path}`;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = posterUrl;
    img.onload = function() {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(img);
        document.querySelector('#movie-info h2').style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
    moviePosterContainer.innerHTML = `<img src="${posterUrl}" alt="${movie.title} Poster">`;

    // Exibindo outras informações do filme
    const html = `
        <h2>${movie.title}</h2>
        <p><strong>Sinopse:</strong> ${movie.overview}</p>
        <p><strong>Data de Lançamento:</strong> ${movie.release_date}</p>
        <p><strong>Nota:</strong> ${movie.vote_average}</p>
        <p><strong>Diretor:</strong> ${getDirector(movie.credits.crew)}</p>
        <p><strong>Atores:</strong> ${getActors(movie.credits.cast)}</p>
        <button id="openPlayerBtn" onclick="openPlayer('${movie.id}')">Assistir Filme</button>
    `;
    movieInfoContainer.innerHTML = html;
}

function getDirector(crew) {
    const director = crew.find(member => member.job === 'Director');
    return director ? director.name : 'Não encontrado';
}

function getActors(cast) {
    const actors = cast.slice(0, 5).map(actor => actor.name);
    return actors.join(', ');
}

function openPlayer(movieId) {
    const modal = document.getElementById('playerModal');
    const playerContainer = document.getElementById('player-container');
    const playerFrame = document.getElementById('playerFrame');

    // Exemplo de URL de legenda (.vtt)
    const subtitleUrl = 'https://example.com/subtitles/movie_en.vtt';

    // Exemplo de URL do player com legendas
    const playerUrl = `https://vidsrc.xyz/embed/movie?tmdb=${movieId}&sub_url=${encodeURIComponent(subtitleUrl)}`;

    // Define a URL do iframe
    playerFrame.src = playerUrl;

    // Exibe o modal
    modal.style.display = 'block';

    // Fecha o modal ao clicar no botão de fechar
    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        playerFrame.src = ''; // Limpa a URL do player ao fechar
    };

    // Fecha o modal ao clicar fora do modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            playerFrame.src = ''; // Limpa a URL do player ao fechar
        }
    };
}


