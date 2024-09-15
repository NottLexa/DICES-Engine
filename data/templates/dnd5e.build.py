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

#endregion

#region [Abilities]

character_abilities_attributes = tb.AttributeTree(
    score = tb.AttributeTree(),
    modifiers = tb.AttributeTree(),
    saving_throws = tb.AttributeTree(),
    skills = tb.AttributeTree(),
    skill_proficiency = tb.AttributeTree(),
    class_skills = tb.Attribute(type = tb.TYPE_ARRAY, name = 'Skills to choose', set = [tb.SET_MANUAL], value = [], variants = []),
    bonuses = tb.AttributeTree(),
    proficiency_bonus = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Proficiency Bonus', set = [tb.SET_AUTO], value = 0),
    inspiration = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Inspiration', set = [tb.SET_MANUAL], value = 0),
    initiative = tb.Attribute(type = tb.TYPE_INTEGER, name = 'Initiative', set = [tb.SET_AUTO], value = 0)
)

for ability in abilities:
    character_abilities_attributes.attributes['score'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_INTEGER, name = ability+' (Score)', set = tb.SET_MANUAL, value = 0,
        effects = ['character.abilities.modifiers.'+ability.lower()+' += :floor((@self - 10) / 2)'])})
    character_abilities_attributes.attributes['modifiers'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_INTEGER, name = ability+' (Modifier)', set = [tb.SET_AUTO], value = 0,
        effects = ['character.abilities.saving_throws.'+ability.lower()+' += @self'])})
    character_abilities_attributes.attributes['saving_throws'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_INTEGER, name = ability+' (ST)', set = [tb.SET_AUTO], value = 0)})
    character_abilities_attributes.attributes['bonuses'].add(**{ability.lower(): tb.Attribute(
        type = tb.TYPE_BOOLEAN, name = ability+' (Bonus)', set = [tb.SET_AUTO], value = False,
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
        class_attribute: tb.Attribute = character_base_attributes.attributes['class']
        class_attribute.add_effect('character.abilities.bonuses.'+saving_throw.lower()+' ||= (:lower(@self) == :lower(\''+str(character_class.lower())+'\'))')

for character_class in skills_by_classes:
    for skill in skills_by_classes[character_class]:
        skill_id = skill.lower().replace(' ', '_')
        class_attribute: tb.Attribute = character_base_attributes.attributes['class']
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
character_base_attributes.attributes['class'].add_effect('character.abilities.class_skills:choice_amount = '+class_skill_amount_formula)

#endregion

#endregion

#region [Classes]

#endregion

#region [Template data]

attributes = tb.AttributeTree(
    character = tb.AttributeTree(
        base = character_base_attributes,
        abilities = character_abilities_attributes
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
    template_json_path = __file__[:-9]+'.json'
    #print(tb.dump_data(template_data))
    with open(template_json_path, 'w') as f:
        if ('-compact' in sys.argv[1:]):
            json.dump(template_data.parse(), f)
        else:
            json.dump(template_data.parse(), f, indent=2)