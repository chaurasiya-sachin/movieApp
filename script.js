const apiKey = "ad2de5fa";
const searchInput = document.getElementById("search-input");
const movieContainer = document.getElementById("movie-container");
const loadingSpinner = document.getElementById("loading-spinner");
const detailsModal = document.getElementById("details-modal");
const detailsContainer = document.getElementById("details-container");
const closeModal = document.getElementById("close-modal");
const pagination = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");


let currentPage = 1;
let currentQuery = "";


let debounceTimer;
function debounce(func, delay) {
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(...args), delay);
    };
}


function showLoading() {
    loadingSpinner.classList.remove("hidden");
}


function hideLoading() {
    loadingSpinner.classList.add("hidden");
}


async function fetchMovies(query, page = 1) {
    if (!query) {
        movieContainer.innerHTML = `<p>Please enter a movie title.</p>`;
        pagination.classList.add("hidden");
        return;
    }

    showLoading();

    const allMovies = [];
    const startPage = (page - 1) * 3 + 1; 

    try {
        for (let i = startPage; i < startPage + 3; i++) {
            const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${query}&type=movie&page=${i}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.Response === "True") {
                allMovies.push(...data.Search); 
            } else {
                break;
            }
        }

        hideLoading();

        if (allMovies.length > 0) {
            displayMovies(allMovies);
            updatePagination(query, page, allMovies.length * 2.5); 
        } else {
            movieContainer.innerHTML = `<p>No movies found.</p>`;
            pagination.classList.add("hidden");
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        movieContainer.innerHTML = `<p>Error fetching movies. Please try again later.</p>`;
        hideLoading();
        pagination.classList.add("hidden");
    }
}


function displayMovies(movies) {
    console.log(movies);
    movieContainer.innerHTML = movies
        .map(movie => `
            <div class="movie-card" onclick="fetchMovieDetails('${movie.imdbID}')">
                <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="${movie.Title}">
                <h3>${movie.Title}</h3>
                <p>Year: ${movie.Year}</p>
            </div>
        `)
        .join("");
}


function updatePagination(query, page, totalResults) {
    currentQuery = query;
    currentPage = page;
    const totalPages = Math.ceil(totalResults / 30); 

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    pagination.classList.remove("hidden");
}

// Fetch Movie Details
async function fetchMovieDetails(id) {
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`;

    try {
        showLoading();
        const response = await fetch(url);
        const movie = await response.json();

        hideLoading();
        console.log(movie);
        displayMovieDetails(movie);
    } catch (error) {
        console.error("Error fetching movie details:", error);
        hideLoading();
    }
}


function displayMovieDetails(movie) {
    console.log("Movie Details:", movie);
    detailsContainer.innerHTML = `
        <h2>${movie.Title}</h2>
        <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="${movie.Title}">
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <p><strong>Cast:</strong> ${movie.Actors}</p>
        <p><strong>Release Date:</strong> ${movie.Released}</p>
        <p><strong>Rating:</strong> ${movie.imdbRating}</p>
    `;

    detailsModal.classList.remove("hidden");
}


closeModal.addEventListener("click", () => {
    detailsModal.classList.add("hidden");
});


prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        fetchMovies(currentQuery, currentPage - 1);
    }
});

nextPageBtn.addEventListener("click", () => {
    fetchMovies(currentQuery, currentPage + 1);
});


searchInput.addEventListener("input", debounce(event => {
    fetchMovies(event.target.value, 1);
}, 500));


window.addEventListener("DOMContentLoaded", () => {
    fetchMovies("Marvel", 1);
});

const scrollToTopButton = document.getElementById("scroll-to-top");


window.addEventListener("scroll", () => {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        scrollToTopButton.style.display = "block";
    } else {
        scrollToTopButton.style.display = "none"; 
    }
});


scrollToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); 
});
