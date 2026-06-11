let allPokemon = [];
let allPokemonUpdated = [];
let searchablePokemon = [];

async function initPokemonDatabase() {
    await loadPokemonList();
    loadUpdatedPokemonFromLocalStorage();
    await checkCurrentPokemonCount();
    searchablePokemon = allPokemon.concat(allPokemonUpdated);
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
        clearPokemonResults();
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

function clearPokemonResults() {
    document.getElementById("fetchPokemon").innerHTML = "";
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