function getPokemonTemplate(data) {
    return `
        <button class="card_button">
            <div class="pokemon_card type_${data.primaryType} card_hover_${data.primaryType}">
                <div class="pokemon_info">
                    <p class="improve_visibility">(ID: #${data.pokemon.id})</p>
                    <h2 class="improve_visibility">${data.germanName}</h2>
                    <p class="improve_visibility">(${data.englishName})</p>
                    <div class="pokemon_img" data-id="card-image">
                        <img src="${data.primarySprite}" alt="${data.germanName}">
                    </div>
                    <div class="pokemon_types">${renderTypeIcons(data.pokemonTypes)}</div>
                </div>
            </div>
        </button>
    `;
}

function getSortedPokemonListTemplate(dataList) {
    return `
        <div class="fetch_pokemon">
        ${renderPokemonList(dataList)}
        </div>
        <button class="load_more_button" data-id="load-more-button" onclick="loadMorePokemonCards()">
            +20 Pokemon
        </button>
    `;
}

function getLoaderTemplate() {
    return `
        <div id="showLoader" class="loader hidden">
            <img class="rotation_animation" src="./assets/images/pokeball_standard_metalic.webp" alt="Pokéball Bild">
        </div>
    `;
}

function getTypeIconTemplate(type) {
    return `
        <img class="icon_${type.englishName}" src="${type.icon}" alt="${type.germanName}">
    `;
}

function getNoPokemonFoundTemplate() {
    return `
        <div class="center" data-id="not-found">
            <h3>Kein passendes Pokémon gefunden.</h3>
        </div>
    `;
}

function getPokemonErrorTemplate() {
    return `
        <div class="center">
            <h3>Pokémon konnte nicht geladen werden.</h3>
        </div>
    `;
}