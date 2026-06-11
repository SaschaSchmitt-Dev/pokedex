function getPokemonTemplate(data) {
    return `
        <button class="card_button">
            <div class="pokemon_card type_${data.primaryType} card_hover_${data.primaryType}">
                <div class="pokemon_info">
                    <p class="improve_visibility">(ID: #${data.pokemon.id})</p>
                    <h2 class="improve_visibility">${data.germanName}</h2>
                    <p class="improve_visibility">(${data.englishName})</p>
                    <div class="pokemon_img">
                        <img src="${data.primarySprite}" alt="${data.germanName}">
                    </div>
                    <div class="pokemon_types">${renderTypeIcons(data.pokemonTypes)}</div>
                </div>
            </div>
        </button>
    `;
}

function getLoaderTemplate() {
    return `
        <div class="loader">
            <img class="rotation_animation" src="./assets/images/pokeball_standard_metalic.webp" alt="Pokéball Bild">
        </div>
    `;
}

function getTypeIconTemplate(type) {
    return `
        <img class="icon_${type.englishName}" src="${type.icon}" alt="${type.germanName}">
    `;
}