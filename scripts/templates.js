function getPokemonTemplate(data) {
    return `
        <button class="card_button" onclick="openPokemonDialog(${data.pokemon.id})">
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

function getPokemonDialogTemplate(data) {
    return `
        <div class="pokemon_dialog dialog_type_${data.primaryType}" onclick="event.stopPropagation()">
            <div class="pokemon_dialog_content">
                <div class="dialog_top_wrapper">
                    <div class="dialog_pokemon_info center_elements">
                        <p class="improve_visibility">(ID: #${data.pokemon.id})</p>
                        <h2 class="improve_visibility title_${data.primaryType} title_shadow">${data.germanName}</h2>
                        <p class="improve_visibility">(${data.englishName})</p>
                        <div class="dialog_pokemon_img center_elements">
                            <img src="${data.primarySprite}" alt="${data.germanName}">
                        </div>
                        <div class="dialog_pokemon_types">${renderTypeIcons(data.pokemonTypes)}</div>
                    </div>
                    <div class="dialog_pokemon_data">
                        <div class="pokemon_data_top border_${data.primaryType}">
                            <h5 class="title_${data.primaryType} title_shadow">Infos</h5>
                            <table class="pokemon_table info_table info_table_${data.primaryType}">
                                <tr><td>Pokédex-ID</td><td>${data.pokemon.id}</td></tr>
                                <tr><td>Typ</td><td>${getGermanTypeNames(data.pokemonTypes)}</td></tr>
                                <tr><td>Größe</td><td>${data.pokemon.height * 10} cm</td></tr>
                                <tr><td>Gewicht</td><td>${data.pokemon.weight / 10} kg</td></tr>
                                <tr><td>Fähigkeiten</td><td>${buildCommaSeparatedText(data.germanAbilities)}</td></tr>
                            </table>
                        </div>
                        <div class="pokemon_data_bottom border_${data.primaryType}">
                            <h5 class="title_${data.primaryType} title_shadow">Statuswerte</h5>
                            <table class="pokemon_table stats_table stats_table_${data.primaryType}">
                                ${renderPokemonStatsTable(data.pokemon.stats, data.germanStats, data.primaryType)}
                            </table>
                        </div>
                    </div>
                </div>
                <div class="dialog_pokemon_description center_elements border_${data.primaryType}">
                    <h3>${data.germanDescription}</h3>
                </div>
                <div class="pokemon_evolution evolution_${data.primaryType}">
                    <h4 class="title_${data.primaryType} title_shadow">Entwicklungen</h4>
                    <div class="pokemon_evolution_cards">
                        ${renderEvolutionCards(data.evolutions, data.primaryType)}
                    </div>
                </div>
            </div>
        </div>`;
}

function getPokemonStatRowTemplate(statName, statValue, statWidth, primaryType) {
    return `
        <tr>
            <td>${statName}</td>
            <td class="stat_value">${statValue}</td>
            <td>
                <div class="stat_bar_wrapper stat_bar_wrapper_${primaryType}">
                    <div class="stat_bar stat_bar_${primaryType}" style="width:${statWidth}%"></div>
                </div>
            </td>
            <td class="stat_max">255</td>
        </tr>`;
}

function getPokemonStatsSumTemplate(statSum, primaryType) {
    return `
        <tr class="stats_sum stats_sum_${primaryType}">
            <td>Summe</td>
            <td class="stat_value">${statSum}</td>
            <td></td>
            <td></td>
        </tr>`;
}
function getEvolutionStepTemplate(evolutions, evolutionIndex, primaryType) {
    return `
        <div class="evolution_step">
            ${getEvolutionCardTemplate(evolutions[evolutionIndex], primaryType)}
            ${evolutionIndex < evolutions.length - 1 ? `<div class="evolution_arrow evolution_arrow_${primaryType}">➜</div>` : ""}
        </div>`;
}

function getEvolutionCardTemplate(evolution, primaryType) {
    return `
        <div class="pokemon_evolution_card border_${primaryType} card_hover_${primaryType}" onclick="openPokemonDialog(${evolution.id})">
            <div class="evolution_pokemon_content center_elements">
                <p>(ID: #${evolution.id})</p>
                <h2 class="title_${primaryType} title_shadow">${evolution.germanName}</h2>
                <p>(${evolution.englishName})</p>
                <div class="evolution_pokemon_img center_elements">
                    <img src="${evolution.sprite}" alt="${evolution.germanName}">
                </div>
                <div class="evolution_pokemon_types">${renderTypeIcons(evolution.types)}</div>
            </div>
        </div>`;
}

function getEvolutionTreeTemplate(evolutionTreeHTML) {
    return `<div class="evolution_tree_wrapper">${evolutionTreeHTML}</div>`;
}

function getEvolutionLeafTemplate(evolution, primaryType) {
    return `
        <div class="evolution_leaf">
            ${getEvolutionCardTemplate(evolution, primaryType)}
        </div>`;
}

function getEvolutionBranchTemplate(evolution, childrenHTML, primaryType) {
    return `
        <div class="evolution_branch_step">
            <div class="evolution_branch_parent">
                ${getEvolutionCardTemplate(evolution, primaryType)}
            </div>
            <div class="evolution_arrow evolution_arrow_${primaryType} evolution_branch_arrow">➜</div>
            <div class="evolution_branch_children">
                ${childrenHTML}
            </div>
        </div>`;
}