import sys
try:
    from core import template_builder as tb
except:
    import pathlib
    sys.path.append(str(pathlib.Path(__file__).parent.parent.parent))
    from core import template_builder as tb
import json

#region [String Arrays]

class_variants = sorted(['Bard', 'Barbarian', 'Fighter', 'Wizard', 'Druid', 'Cleric', 'Warlock',
                         'Monk', 'Paladin', 'Rogue', 'Ranger', 'Sorcerer'])
race_variants = sorted(['Gnome', 'Dwarf', 'Dragonborn', 'Half-orc', 'Halfling', 'Half-Elf', 'Tiefling', 'Human', 'Elf'])
background_variants = sorted(['Entertainer', 'Urchin', 'Noble', 'Guild Artisan', 'Gladiator', 'Guild Merchant',
                              'Sailor', 'Sage', 'Folk Hero', 'Hermit', 'Pirate', 'Criminal', 'Acolyte', 'Knight',
                              'Soldier', 'Outlander', 'Charlatan', 'Spy', 'Custom'])
alignment_variants = sorted(['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral',
                             'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'])
abilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
skills = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival']
saving_throws_by_classes = {
    'Bard': ['Dexterity', 'Charisma'],
    'Barbarian': ['Strength', 'Constitution'],
    'Fighter': ['Strength', 'Constitution'],
    'Wizard': ['Intelligence', 'Wisdom'],
    'Druid': ['Intelligence', 'Wisdom'],
    'Cleric': ['Wisdom', 'Charisma'],
    'Warlock': ['Wisdom', 'Charisma'],
    'Monk': ['Strength', 'Dexterity'],
    'Paladin': ['Wisdom', 'Charisma'],
    'Rogue': ['Dexterity', 'Intelligence'],
    'Ranger': ['Strength', 'Dexterity'],
    'Sorcerer': ['Constitution', 'Charisma']
}
skills_by_abilities = {
    'Strength': ['Athletics'],
    'Dexterity': ['Acrobatics', 'Sleight of Hand', 'Stealth'],
    'Constitution': [],
    'Intelligence': ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'],
    'Wisdom': ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'],
    'Charisma': ['Deception', 'Intimidation', 'Performance', 'Persuasion']}

skills_by_classes = {
    'Bard': ['Athletics', 'Acrobatics', 'Sleight of Hand', 'Stealth', 'History', 'Arcana', 'Nature', 'Investigation', 'Religion', 'Perception', 'Survival', 'Medicine', 'Insight', 'Animal Handling', 'Performance', 'Intimidation', 'Deception', 'Persuasion'],
    'Barbarian': ['Athletics', 'Perception', 'Survival', 'Intimidation', 'Nature', 'Animal Handling'],
    'Fighter': ['Acrobatics', 'Athletics', 'Perception', 'Survival', 'Intimidation', 'History', 'Insight', 'Animal Handling'],
    'Wizard': ['History', 'Arcana', 'Medicine', 'Insight', 'Investigation', 'Religion'],
    'Druid': ['Perception', 'Survival', 'Arcana', 'Medicine', 'Animal Handling', 'Nature', 'Insight', 'Religion'],
    'Cleric': ['History', 'Medicine', 'Insight', 'Religion', 'Persuasion'],
    'Warlock': ['Intimidation', 'History', 'Arcana', 'Deception', 'Nature', 'Investigation', 'Religion'],
    'Monk': ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
    'Paladin': ['Athletics', 'Intimidation', 'Medicine', 'Insight', 'Religion', 'Persuasion'],
    'Rogue': ['Acrobatics', 'Athletics', 'Perception', 'Performance', 'Intimidation', 'Sleight of Hand', 'Deception', 'Insight', 'Investigation', 'Stealth', 'Persuasion'],
    'Ranger': ['Athletics', 'Perception', 'Survival', 'Nature', 'Insight', 'Investigation', 'Stealth', 'Animal Handling'],
    'Sorcerer': ['Intimidation', 'Arcana', 'Deception', 'Insight', 'Religion', 'Persuasion']}

skill_amount_by_classes = {
    'Bard': 3,
    'Barbarian': 2,
    'Fighter': 2,
    'Wizard': 2,
    'Druid': 2,
    'Cleric': 2,
    'Warlock': 2,
    'Monk': 2,
    'Paladin': 2,
    'Rogue': 4,
    'Ranger': 3,
    'Sorcerer': 2}

hit_dices_by_classes = {
    'Bard': 8,
    'Barbarian': 12,
    'Fighter': 10,
    'Wizard': 6,
    'Druid': 8,
    'Cleric': 8,
    'Warlock': 8,
    'Monk': 8,
    'Paladin': 10,
    'Rogue': 8,
    'Ranger': 10,
    'Sorcerer': 6}

#endregion

#region [Character's attributes]

#region [Base]

character_base_attributes = tb.AttributeTree(
    name = tb.Attribute(type = tb.TYPE_STRING, name = "Character's name", set = [tb.SET_MANUAL], value = ''),
    _class = tb.Attribute(type = tb.TYPE_STRING, name = "Character's class", set = [tb.SET_MANUAL], value = '', variants = class_variants),
    race = tb.Attribute(type = tb.TYPE_STRING, name = "Character's race", set = [tb.SET_MANUAL], value = '', variants = race_variants),
    background = tb.Attribute(type = tb.TYPE_STRING, name = "Character's background", set = [tb.SET_MANUAL], value = '', variants = background_variants),
    player_name = tb.Attribute(type = tb.TYPE_STRING, name = "Player's name", set = [tb.SET_MANUAL], value = ''),
    alignment = tb.Attribute(type = tb.TYPE_STRING, name = "Character's alignment", set = [tb.SET_MANUAL], value = '', variants = alignment_variants),
    xp = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Experience', set = [tb.SET_MANUAL], value = 0),
    level = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Level', set = [tb.SET_MANUAL], value = 1,
        effects = ['character.abilities.proficiency_bonus += :ceil(@self/4) + 1']),
)

class_attribute: tb.Attribute = character_base_attributes.attributes['class']
level_attribute: tb.Attribute = character_base_attributes.attributes['level']

#endregion

#region [Abilities]

character_abilities_attributes = tb.AttributeTree(
    starting_score = tb.AttributeTree(),
    score = tb.AttributeTree(),
    modifiers = tb.AttributeTree(),
    saving_throws = tb.AttributeTree(),
    saving_throw_proficiency = tb.AttributeTree(),
    skills = tb.AttributeTree(),
    skill_proficiency = tb.AttributeTree(),
    class_skills = tb.Attribute(type = tb.TYPE_ARRAY, name = 'Skills to choose', set = [tb.SET_MANUAL], value = [], variants = []),
    proficiency_bonus = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Proficiency Bonus', set = [tb.SET_AUTO], value = 0),
    inspiration = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Inspiration', set = [tb.SET_MANUAL], value = 0),
    initiative = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Initiative', set = [tb.SET_AUTO], value = 0),
    passive_perception = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Passive Perception', set = [tb.SET_AUTO], value = 0)
)

for ability in abilities:
    character_abilities_attributes.attributes['starting_score'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_INTEGER, name = ability+' (Starting score)', set = tb.SET_MANUAL, value = 0,
        effects = ['character.abilities.score.'+ability.lower()+' += @self'], value_min = 0, value_max = 20)})
    character_abilities_attributes.attributes['score'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_INTEGER, name = ability+' (Score)', set = tb.SET_AUTO, value = 0,
        effects = ['character.abilities.modifiers.'+ability.lower()+' += :floor((@self - 10) / 2)'])})
    character_abilities_attributes.attributes['modifiers'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_INTEGER, name = ability+' (Modifier)', set = [tb.SET_AUTO], value = 0,
        effects = ['character.abilities.saving_throws.'+ability.lower()+' += @self'])})
    character_abilities_attributes.attributes['saving_throws'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_INTEGER, name = ability+' (ST)', set = [tb.SET_AUTO], value = 0)})
    character_abilities_attributes.attributes['saving_throw_proficiency'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_BOOLEAN, name = ability+' (ST Proficiency)', set = [tb.SET_AUTO], value = False,
        effects = ['character.abilities.saving_throws.'+ability.lower()+' += :if(@self, character.abilities.proficiency_bonus, 0)'])})

for ability in skills_by_abilities:
    for skill in skills_by_abilities[ability]:
        skill_id = skill.lower().replace(' ', '_')
        character_abilities_attributes.attributes['skills'].add(**{skill_id: tb.Attribute(
            type = tb.TYPE_INTEGER, name = skill, set = [tb.SET_AUTO], value = 0)})
        character_abilities_attributes.attributes['skill_proficiency'].add(**{skill_id: tb.Attribute(
            type = tb.TYPE_INTEGER, name = skill+' (Proficiency)', set = [tb.SET_AUTO], value = 0, value_min = 0,
            value_max = 2, effects = ['character.abilities.skills.'+skill_id+' += character.abilities.proficiency_bonus * @self'])
        })
        ability_modifier: tb.Attribute = character_abilities_attributes.attributes['modifiers'].attributes[ability.lower()]
        ability_modifier.add_effect('character.abilities.skills.'+skill_id+' += character.abilities.modifiers.'+ability.lower())

for character_class in saving_throws_by_classes:
    for saving_throw in saving_throws_by_classes[character_class]:
        class_attribute.add_effect('character.abilities.saving_throw_proficiency.'+saving_throw.lower()+' ||= (:lower(@self) == :lower(\''+str(character_class.lower())+'\'))')

for character_class in skills_by_classes:
    for skill in skills_by_classes[character_class]:
        skill_id = skill.lower().replace(' ', '_')
        class_attribute.add_effect('character.abilities.class_skills:variants .= :if(:lower(@self) == :lower(\''+character_class.lower()+'\'), [\''+skill+'\'], [])')

for skill in skills:
    skill_id = skill.lower().replace(' ', '_')
    character_abilities_attributes.attributes['class_skills'].add_effect('character.abilities.skill_proficiency.'+skill_id+' += :array_count(character.abilities.class_skills, \''+skill+'\')')

class_skill_amount_formula = 'Z'
for character_class in skill_amount_by_classes:
    skill_amount = skill_amount_by_classes[character_class]
    class_skill_amount_formula = class_skill_amount_formula.replace('Z', ':if(:lower(@self) == :lower(\'X\'), Y, Z)')
    class_skill_amount_formula = class_skill_amount_formula.replace('X', character_class.lower())
    class_skill_amount_formula = class_skill_amount_formula.replace('Y', str(skill_amount))
class_skill_amount_formula = class_skill_amount_formula.replace('Z', '0')
class_attribute.add_effect('character.abilities.class_skills:choice_amount = '+class_skill_amount_formula)

character_abilities_attributes.attributes['modifiers'].attributes['dexterity'].add_effect('character.abilities.initiative += 1d20 + @self')
character_abilities_attributes.attributes['modifiers'].attributes['wisdom'].add_effect('character.abilities.passive_perception += 10 + @self')

#endregion

#region [Physical]

character_physical_attributes = tb.AttributeTree(
    armor_class = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Armor Class', set = [tb.SET_AUTO], value = 0),
    speed = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Speed', set = [tb.SET_MANUAL], value_min = 0, value = 0),
    max_hp = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Max HP', set = [tb.SET_AUTO], value = 0),
    hp = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Current HP', set = [tb.SET_MANUAL], value_min = 0, value = 0),
    temp_hp = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Temporary HP', set = [tb.SET_MANUAL], value = 0),
    hit_dice = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Hit Dice (magnitude)', set = [tb.SET_AUTO], value = 0),
    death_saves = tb.AttributeTree(
        successes = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Death saves: Successes', set = [tb.SET_MANUAL],
            value_min = 0, value_max = 3, value = 0),
        failures = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Death saves: Failures', set = [tb.SET_MANUAL],
            value_min = 0, value_max = 3, value = 0),
    ),
    carrying_capacity = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Carrying capacity', set = [tb.SET_AUTO], value = 0)
)

for character_class in hit_dices_by_classes:
    hit_dice_magnitude = hit_dices_by_classes[character_class]
    character_physical_attributes.attributes['hit_dice'].add_effect(f'character.physical.hit_dice += :if(:lower(character.base.class) == :lower(\'{character_class}\'), {hit_dice_magnitude}, 0)')

character_physical_attributes.attributes['max_hp'].add_effect('character.physical.hp:value_max = @self')
level_attribute.add_effect('character.physical.max_hp += :max(0, character.physical.hit_dice + @dice(:max(@self-1, 0), character.physical.hit_dice) + character.abilities.modifiers.constitution*@self)')

character_abilities_attributes.attributes['modifiers'].attributes['dexterity'].add_effect('character.physical.armor_class += :if(character.equipment.armor_on, 0, 10+@self)')
character_abilities_attributes.attributes['score'].attributes['strength'].add_effect('character.physical.carrying_capacity += @self * 15')

#endregion

#region [Equipment]

character_equipment_attributes = tb.AttributeTree(
    armor_on = tb.Attribute(type = tb.TYPE_BOOLEAN, name = 'Armor on', set = [tb.SET_AUTO], value = False),
    armor = tb.AttributeTree(
        name = tb.Attribute(type = tb.TYPE_STRING, name = 'Armor name', set = [tb.SET_AUTO], value = ''),
        type = tb.Attribute(type = tb.TYPE_STRING, name = 'Armor type', set = [tb.SET_AUTO], value = ''),
        _class = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Armor\'s class', set = [tb.SET_AUTO], value = 0),
        strength_limit = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Armor type', set = [tb.SET_AUTO], value = 0),
        stealth_disadvantage = tb.Attribute(type = tb.TYPE_BOOLEAN, name = 'Stealth Disadvantage', set = [tb.SET_AUTO], value = False),
    ),
    spells = tb.AttributeTree(),
    items = tb.AttributeTree()
)

spell_slots = {}
for level in range(1, 9+1):
    spell_slots[f'level{level}'] = tb.Attribute(type = tb.TYPE_INTEGER, name = f'Spell slots (level {level})',
        set = [tb.SET_AUTO], value = 0)

character_spells_attributes = tb.AttributeTree(
    spell_amount = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Spell amount', set = [tb.SET_AUTO], value = 0),
    catnip_amount = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Catnip amount', set = [tb.SET_AUTO], value = 0),
    spell_slots = tb.AttributeTree(**spell_slots)
)

#endregion

#endregion

#region [Classes]

#endregion

#region [Template data]

attributes = tb.AttributeTree(
    character = tb.AttributeTree(
        base = character_base_attributes,
        abilities = character_abilities_attributes,
        physical = character_physical_attributes,
        equipment = character_equipment_attributes,
        spells = character_spells_attributes,
    ),
    classes = tb.AttributeTree(
        warrior = tb.AttributeTree(

        )
    )
)

template_data = tb.TemplateData(
    name = 'Dungeons & Dragons: 5th Edition',
    version = 1,
    attributes = attributes
)

#endregion

if __name__ == '__main__':
    with open(__file__[:(-9 if __file__.endswith('.build.py') else -3)]+'.json', 'w') as f:
        json.dump(template_data.parse(), f, indent=(None if '-compact' in sys.argv[1:] else 2))