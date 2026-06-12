let currentPokemonId = 0;

async function openPokemonDialog(id) {
    currentPokemonId = id;
    const dialog = document.getElementById("pokemonDetailsDialog");
    openEmptyPokemonDialog(dialog);

    try {
        await fillPokemonDialog(dialog, id);
    } catch (error) {
        showPokemonDialogError(dialog, error);
    }
}

function openEmptyPokemonDialog(dialog) {
    dialog.innerHTML = getLoaderTemplate();
    dialog.showModal();
    document.body.classList.add("no_scroll");
}

async function fillPokemonDialog(dialog, id) {
    const pokemonData = await loadOnePokemonDialogData(id);
    dialog.innerHTML = getPokemonDialogTemplate(pokemonData);
}

function showPokemonDialogError(dialog, error) {
    console.error(error);
    dialog.innerHTML = "";
}

function closeDialog(dialogId) {
    const dialogRef = document.getElementById(dialogId);

    if (dialogRef.open) {
        dialogRef.close();
    }

    document.body.classList.remove("no_scroll");
}

function stopBubbling(event) {
    event.stopPropagation();
}

function renderPokemonStatsTable(stats, germanStats, primaryType) {
    const statRows = renderPokemonStatsRows(stats, germanStats, primaryType);
    const statSum = calculatePokemonStatsSum(stats);

    return statRows + getPokemonStatsSumTemplate(statSum, primaryType);
}

function renderPokemonStatsRows(stats, germanStats, primaryType) {
    let html = "";

    for (let statIndex = 0; statIndex < stats.length; statIndex++) {
        html += getPreparedStatRow(stats[statIndex], germanStats, primaryType);
    }

    return html;
}

function getPreparedStatRow(stat, germanStats, primaryType) {
    const statName = getStatName(stat, germanStats);
    const statWidth = calculatePokemonStatWidth(stat.base_stat);

    return getPokemonStatRowTemplate(statName, stat.base_stat, statWidth, primaryType);
}

function getStatName(stat, germanStats) {
    if (germanStats[stat.stat.name]) {
        return germanStats[stat.stat.name];
    }

    return stat.stat.name;
}

function calculatePokemonStatWidth(statValue) {
    return Math.min(statValue / 2.55, 100);
}

function calculatePokemonStatsSum(stats) {
    let sum = 0;

    for (let statIndex = 0; statIndex < stats.length; statIndex++) {
        sum += stats[statIndex].base_stat;
    }

    return sum;
}

async function loadOnePokemonDialogData(id) {
    const pokemon = await fetchPokeApi("https://pokeapi.co/api/v2/pokemon/" + id);
    const species = await fetchPokeApi(pokemon.species.url);

    return buildPokemonDialogData(pokemon, species);
}

async function buildPokemonDialogData(pokemon, species) {
    const pokemonTypes = await getPokemonTypes(pokemon);
    const pokemonData = getBasicPokemonData(pokemon, species, pokemonTypes);

    const dialogDetails = await Promise.all([
        getPokemonAbilities(pokemon),
        getPokemonEvolution(species)
    ]);

    pokemonData.germanAbilities = dialogDetails[0];
    pokemonData.evolutions = dialogDetails[1];

    return pokemonData;
}

function getPokemonDescription(species) {
    for (let entryIndex = 0; entryIndex < species.flavor_text_entries.length; entryIndex++) {
        const entry = species.flavor_text_entries[entryIndex];

        if (entry.language.name === "de") {
            return entry.flavor_text.replace(/\f/g, " ");
        }
    }

    return "Keine Beschreibung vorhanden";
}

async function getType(pokemonType) {
    const typeData = await fetchPokeApi(pokemonType.type.url);
    const germanName = getNameByLanguage(typeData.names, "de");

    if (germanName) {
        return germanName.name;
    }

    return pokemonType.type.name;
}

async function getPokemonAbilities(pokemon) {
    return Promise.all(
        pokemon.abilities.map(function (abilityEntry) {
            return getPokemonAbility(abilityEntry);
        })
    );
}

async function getPokemonAbility(abilityEntry) {
    const abilityData = await fetchPokeApi(abilityEntry.ability.url);
    const germanAbilityName = getNameByLanguage(abilityData.names, "de");

    if (germanAbilityName) {
        return germanAbilityName.name;
    }

    return abilityEntry.ability.name;
}

function getPokemonStatsGer() {
    return {
        "hp": "KP",
        "attack": "Angriff",
        "defense": "Verteidigung",
        "special-attack": "Spezial-Angriff",
        "special-defense": "Spezial-Verteidigung",
        "speed": "Initiative"
    };
}

function getGermanTypeNames(pokemonTypes) {
    const names = [];

    for (let typeIndex = 0; typeIndex < pokemonTypes.length; typeIndex++) {
        names.push(pokemonTypes[typeIndex].germanName);
    }

    return buildCommaSeparatedText(names);
}

async function getPokemonEvolution(species) {
    const evolutionData = await fetchPokeApi(species.evolution_chain.url);

    return buildEvolutionTree(evolutionData.chain);
}

async function buildEvolutionTree(evolutionNode) {
    const evolutionDetails = await getEvolutionDetails(evolutionNode.species.name);
    const children = await Promise.all(
        evolutionNode.evolves_to.map(function (childEvolution) {
            return buildEvolutionTree(childEvolution);
        })
    );

    evolutionDetails.children = children;

    return evolutionDetails;
}

async function getEvolutionDetails(speciesName) {
    const species = await fetchPokeApi("https://pokeapi.co/api/v2/pokemon-species/" + speciesName);
    const defaultVariety = getDefaultPokemonForm(species);
    const pokemon = await fetchPokeApi(defaultVariety.pokemon.url);

    return buildEvolutionDetails(species, pokemon);
}

function getDefaultPokemonForm(species) {
    const pokemonForms = species.varieties;

    for (let formIndex = 0; formIndex < pokemonForms.length; formIndex++) {
        if (pokemonForms[formIndex].is_default) {
            return pokemonForms[formIndex];
        }
    }

    return pokemonForms[0];
}

async function buildEvolutionDetails(species, pokemon) {
    return {
        id: pokemon.id,
        germanName: getGermanPokemonName(species, pokemon),
        englishName: getEnglishPokemonName(pokemon),
        sprite: getPrimarySprite(pokemon),
        types: await getPokemonTypes(pokemon)
    };
}

function buildCommaSeparatedText(textParts) {
    let commaSeparatedText = "";

    for (let textIndex = 0; textIndex < textParts.length; textIndex++) {
        commaSeparatedText += getCommaSeparatedTextPart(textParts, textIndex);
    }

    return commaSeparatedText;
}

function getCommaSeparatedTextPart(textParts, textIndex) {
    if (textIndex < textParts.length - 1) {
        return textParts[textIndex] + ", ";
    }

    return textParts[textIndex];
}


function renderEvolutionCards(evolutionTree, primaryType) {
    if (!evolutionTree) {
        return "";
    }

    if (isLinearEvolutionTree(evolutionTree)) {
        return renderLinearEvolutionCards(flattenEvolutionTree(evolutionTree), primaryType);
    }

    return getEvolutionTreeTemplate(renderBranchEvolutionTree(evolutionTree, primaryType));
}

function isLinearEvolutionTree(evolutionNode) {
    if (evolutionNode.children.length > 1) {
        return false;
    }

    if (evolutionNode.children.length === 0) {
        return true;
    }

    return isLinearEvolutionTree(evolutionNode.children[0]);
}

function flattenEvolutionTree(evolutionNode) {
    const evolutions = [evolutionNode];

    if (evolutionNode.children.length === 1) {
        return evolutions.concat(flattenEvolutionTree(evolutionNode.children[0]));
    }

    return evolutions;
}

function renderLinearEvolutionCards(evolutions, primaryType) {
    let html = "";

    for (let evolutionIndex = 0; evolutionIndex < evolutions.length; evolutionIndex++) {
        html += getEvolutionStepTemplate(evolutions, evolutionIndex, primaryType);
    }

    return html;
}

function renderBranchEvolutionTree(evolutionNode, primaryType) {
    const childrenHTML = evolutionNode.children
        .map(function (childEvolution) { return renderBranchEvolutionTree(childEvolution, primaryType); }).join("");

    if (evolutionNode.children.length === 0) {
        return getEvolutionLeafTemplate(evolutionNode, primaryType);
    }

    if (evolutionNode.children.length > 2) {
        return getEvolutionRowBranchTemplate(evolutionNode, childrenHTML, primaryType);
    }

    return getEvolutionBranchTemplate(evolutionNode, childrenHTML, primaryType);
}

function openPreviousPokemon() {
    let cards = document.querySelectorAll(".card_button");

    for (let fetchedIndex = 0; fetchedIndex < cards.length; fetchedIndex++) {
        if (Number(cards[fetchedIndex].id) === currentPokemonId) {

            if (fetchedIndex < cards.length - 1) {
                openPokemonDialog(Number(cards[fetchedIndex - 1].id));
            }

            break;
        }
    }
}

function openNextPokemon() {
    let cards = document.querySelectorAll(".card_button");

    for (let fetchedIndex = 0; fetchedIndex < cards.length; fetchedIndex++) {
        if (Number(cards[fetchedIndex].id) === currentPokemonId) {

            if (fetchedIndex < cards.length - 1) {
                openPokemonDialog(Number(cards[fetchedIndex + 1].id));
            }

            break;
        }
    }
}