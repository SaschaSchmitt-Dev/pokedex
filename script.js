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

function saveNewPokemon(newPokemon) {
    allPokemonUpdated = allPokemonUpdated.concat(newPokemon);
    localStorage.setItem("allPokemonUpdated", JSON.stringify(allPokemonUpdated));
}