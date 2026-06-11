let allPokemon = [];
let allPokemonUpdated = [];
let searchablePokemon = [];
let loadedPokemonCards = [];
const startValue = 20;

async function initPokemonDatabase() {
    await loadPokemonList();
    loadUpdatedPokemonFromLocalStorage();
    await checkCurrentPokemonCount();
    searchablePokemon = allPokemon.concat(allPokemonUpdated);
    await loadInitialPokemonCards();
    console.log("Suchbare Pokémon:", searchablePokemon);
}

async function loadPokemonList() {
    const response = await fetch("./database/pokemon-list.json");
    allPokemon = await response.json();
}

function loadUpdatedPokemonFromLocalStorage() {
    const savedPokemon = localStorage.getItem("allPokemonUpdated");

    if (savedPokemon) {
        allPokemonUpdated = JSON.parse(savedPokemon);
        return;
    }

    allPokemonUpdated = [];
}

async function checkCurrentPokemonCount() {
    const data = await getPokemonCountData();
    const currentLocalCount = allPokemon.length + allPokemonUpdated.length;

    if (currentLocalCount < data.count) {
        await loadMissingPokemon(currentLocalCount + 1, data.count);
    }
}

async function getPokemonCountData() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon-species?limit=1");
    return response.json();
}

async function loadMissingPokemon(startId, endId) {
    const pokemonIds = [];

    for (let pokemonId = startId; pokemonId <= endId; pokemonId++) {
        pokemonIds.push(pokemonId);
    }

    const newPokemon = await Promise.all(
        pokemonIds.map(function (pokemonId) {
            return getPokemonSearchEntry(pokemonId);
        })
    );

    saveNewPokemon(newPokemon);
}

async function getPokemonSearchEntry(pokemonId) {
    const species = await fetchPokeApi("https://pokeapi.co/api/v2/pokemon-species/" + pokemonId);

    return {
        id: pokemonId,
        germanName: getLanguageNameText(species.names, "de"),
        englishName: getLanguageNameText(species.names, "en")
    };
}

function getLanguageNameText(names, language) {
    const nameObject = getNameByLanguage(names, language);

    if (nameObject) {
        return nameObject.name;
    }

    return "";
}

function getNameByLanguage(names, language) {
    for (let nameIndex = 0; nameIndex < names.length; nameIndex++) {
        if (names[nameIndex].language.name === language) {
            return names[nameIndex];
        }
    }

    return null;
}

function saveNewPokemon(newPokemon) {
    allPokemonUpdated = allPokemonUpdated.concat(newPokemon);
    localStorage.setItem("allPokemonUpdated", JSON.stringify(allPokemonUpdated));
}

async function getPokemonFormsCountData() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1");
    return response.json();
}

function searchPokemon() {
    const searchInput = getPokemonSearchInput();

    if (searchInput.length < 3) {
        loadInitialPokemonCards();
        return;
    }

    showPokemonSearchResult(searchInput);
}

function getPokemonSearchInput() {
    return (
        document.getElementById("pokemonSearch").value ||
        document.getElementById("pokemonSearchMobile").value
    ).trim().toLowerCase();
}

function showPokemonSearchResult(searchInput) {
    const searchResult = getMatchingPokemon(searchInput);

    if (searchResult.length === 1) {
        fetchPokemon(searchResult[0].id);
        return;
    }

    buildPokemonList(searchResult);
}

function getMatchingPokemon(searchInput) {
    const searchResult = [];

    for (let pokemonIndex = 0; pokemonIndex < searchablePokemon.length; pokemonIndex++) {
        addPokemonIfMatching(searchResult, searchablePokemon[pokemonIndex], searchInput);
    }

    return searchResult;
}

function addPokemonIfMatching(searchResult, pokemon, searchInput) {
    const germanName = pokemon.germanName.toLowerCase();
    const englishName = pokemon.englishName.toLowerCase();

    if (germanName.includes(searchInput) || englishName.includes(searchInput)) {
        searchResult.push(pokemon);
    }
}

function showAllPokemon() {
    document.getElementById("pokemonSearch").value = "";
    document.getElementById("pokemonSearchMobile").value = "";

    buildPokemonList(allPokemon);
}

const pokeApiCache = new Map();

async function fetchPokeApi(url) {
    if (pokeApiCache.has(url)) {
        return pokeApiCache.get(url);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("PokeAPI request failed: " + response.status + " " + url);
    }

    const data = await response.json();
    pokeApiCache.set(url, data);

    return data;
}

async function loadInitialPokemonCards() {
    const savedCount = localStorage.getItem("loadedPokemonCount");

    if (savedCount) {
        await loadPokemonCardsByCount(Number(savedCount));
        return;
    }

    await loadMorePokemonCards();
}

async function loadPokemonCardsByCount(count) {
    const pokemonToLoad = searchablePokemon.slice(0, count);

    loadedPokemonCards = await Promise.all(
        pokemonToLoad.map(function (pokemon) {
            return loadOnePokemonCardData(pokemon.id);
        })
    );

    renderLoadedPokemonCards();
}

async function loadMorePokemonCards() {
    const startIndex = loadedPokemonCards.length;
    const endIndex = startIndex + startValue;
    const nextPokemon = searchablePokemon.slice(startIndex, endIndex);

    if (!nextPokemon.length) return;

    const newPokemonCards = await Promise.all(nextPokemon.map(function (pokemon) {
        return loadOnePokemonCardData(pokemon.id);
    })
    );

    loadedPokemonCards = loadedPokemonCards.concat(newPokemonCards);
    localStorage.setItem("loadedPokemonCount", loadedPokemonCards.length);
    renderLoadedPokemonCards();
}

function renderLoadedPokemonCards() {
    const searchResults = document.getElementById("fetchPokemon");
    searchResults.innerHTML = getSortedPokemonListTemplate(loadedPokemonCards);
}

function showLoader() {
    const fetchPokemon = document.getElementById("fetchPokemon");

    if (!document.getElementById("showLoader")) {
        fetchPokemon.insertAdjacentHTML("beforeend", getLoaderTemplate());
    }
}

function hideLoader() {
    const loader = document.getElementById("showLoader");

    if (loader) {
        loader.remove();
    }
}