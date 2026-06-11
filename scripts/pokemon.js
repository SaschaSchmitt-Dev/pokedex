async function buildPokemonList(searchResult) {
    const searchResults = document.getElementById("fetchPokemon");

    if (searchResult.length === 0) {
        searchResults.innerHTML = getNoPokemonFoundTemplate();
        return;
    }

    await showPokemonList(searchResults, searchResult);
}

async function showPokemonList(searchResults, searchResult) {
    searchResults.innerHTML = getLoaderTemplate();

    try {
        await updatePokemonList(searchResults, searchResult);
    } catch (error) {
        handlePokemonError(searchResults, error);
    }
}

async function updatePokemonList(searchResults, searchResult) {
    const pokemonDataList = await loadPokemonData(searchResult);
    searchResults.innerHTML = renderPokemonList(pokemonDataList);
}

async function loadPokemonData(searchResult) {
    return Promise.all(
        searchResult.map(function (pokemon) {
            return loadOnePokemonCardData(pokemon.id);
        })
    );
}

async function loadOnePokemonCardData(id) {
    const pokemon = await fetchPokeApi("https://pokeapi.co/api/v2/pokemon/" + id);
    const species = await fetchPokeApi(pokemon.species.url);
    const pokemonTypes = await getPokemonTypes(pokemon);

    return getBasicPokemonData(pokemon, species, pokemonTypes);
}

async function getPokemonTypes(pokemon) {
    return Promise.all(
        pokemon.types.map(function (pokemonType) {
            return getPokemonType(pokemonType);
        })
    );
}

async function getPokemonType(pokemonType) {
    const typeData = await fetchPokeApi(pokemonType.type.url);

    return {
        germanName: getPokemonTypeGermanName(typeData, pokemonType),
        englishName: pokemonType.type.name,
        icon: getPokemonTypeIcon(typeData)
    };
}

function getPokemonTypeGermanName(typeData, pokemonType) {
    const germanNameObject = getNameByLanguage(typeData.names, "de");

    if (germanNameObject) {
        return germanNameObject.name;
    }

    return pokemonType.type.name;
}

async function fetchPokemon(id) {
    const searchResult = document.getElementById("fetchPokemon");
    searchResult.innerHTML = getLoaderTemplate();

    try {
        await renderSinglePokemon(searchResult, id);
    } catch (error) {
        handlePokemonError(searchResult, error);
    }
}

async function renderSinglePokemon(searchResult, id) {
    const pokemonData = await loadOnePokemonCardData(id);
    searchResult.innerHTML = getPokemonTemplate(pokemonData);
}

function getEnglishPokemonName(pokemon) {
    return pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
}

function getGermanPokemonName(species, pokemon) {
    const germanName = getNameByLanguage(species.names, "de");

    if (germanName) {
        return germanName.name;
    }

    return pokemon.name;
}

function getTypeIconUrl(typeData) {
    if (
        typeData.sprites &&
        typeData.sprites["generation-viii"] &&
        typeData.sprites["generation-viii"]["sword-shield"]
    ) {
        return typeData.sprites["generation-viii"]["sword-shield"].symbol_icon;
    }

    return null;
}

function getPokemonTypeIcon(typeData) {
    if (getTypeIconUrl(typeData)) {
        return typeData.sprites["generation-viii"]["sword-shield"].symbol_icon;
    }

    return "";
}

function getPrimaryType(pokemonTypes) {
    if (pokemonTypes.length > 0) {
        return pokemonTypes[0].englishName;
    }

    return "normal";
}

function getPrimarySprite(pokemon) {
    if (pokemon.sprites.other.home.front_default) {
        return pokemon.sprites.other.home.front_default;
    }

    return getFallbackSprite(pokemon);
}

function getFallbackSprite(pokemon) {
    if (pokemon.sprites.other["official-artwork"].front_default) {
        return pokemon.sprites.other["official-artwork"].front_default;
    }

    return pokemon.sprites.front_default;
}

function getBasicPokemonData(pokemon, species, pokemonTypes) {
    return {
        pokemon: pokemon,
        englishName: getEnglishPokemonName(pokemon),
        germanName: getGermanPokemonName(species, pokemon),
        primaryType: getPrimaryType(pokemonTypes),
        pokemonTypes: pokemonTypes,
        primarySprite: getPrimarySprite(pokemon)
    };
}

function renderPokemonList(pokemonDataList) {
    let html = "";

    for (let pokemonIndex = 0; pokemonIndex < pokemonDataList.length; pokemonIndex++) {
        html += getPokemonTemplate(pokemonDataList[pokemonIndex]);
    }

    return html;
}

function renderTypeIcons(types) {
    let html = "";

    for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
        html += getTypeIconTemplate(types[typeIndex]);
    }

    return html;
}

function handlePokemonError(searchResult, error) {
    console.error(error);
    searchResult.innerHTML = "";
}