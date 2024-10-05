# DICES Engine
> (D&D Interactive Character Expandable Sheet Engine) \
> Engine for creating interactive and automated TRPG character sheets.
>
> ex. MareCreator

by Alexey ["NotLexa"]((https://github.com/NottLexa)) Kozhanov (Алексей Кожанов)

[![GitHub License](https://img.shields.io/github/license/NottLexa/DICES-Engine)](https://github.com/NottLexa/DICES-Engine/blob/master/COPYING)

DICES Engine consists of three parts:
* Render engine (for now it's only a plain HTML dynamic page for NW.JS)
* MareCreator Formula Parser (MCFP) - JavaScript's module for parsing attribute effects' or formulas' code, turning them
into JS objects that abstractly represent formula's code parts, and (optionally) converting these objects into JS function.
* Template Builder - Python module for building (compiling) DICES Engine templates in format of JSON, using DICES Engine
attributes written in Python (Python 3.x, preferably >=3.10).

Made for [@arkain123](https://github.com/arkain123) ≽^•⩊•^≼

## How to install

1) Install [NodeJS](https://nodejs.org).
2) Clone the repository.
3) Run shell command `npm install` in repository's directory.

## How to run

1) Run shell command `npm run start` in repository's directory.

## How to build templates

1) Create a python script, preferably with extention `.build.py`:
    ```
    import sys
    try:
        from core import template_builder as tb
    except:
        import pathlib
        sys.path.append(str(pathlib.Path(__file__).parent.parent.parent))
        from core import template_builder as tb
    import json
    
    
    
    ... # here you can generate attribute tree that you will use in template_data later
    
    
    
    template_data = tb.TemplateData(
        name = "", # add template's display name here
        version = 1,
        attributes = tb.AttributeTree(...)
    )
    
    if __name__ == '__main__':
        with open(__file__[:(-9 if __file__.endswith('.build.py') else -3)]+'.json', 'w') as f:
            json.dump(template_data.parse(), f, indent=(None if '-compact' in sys.argv[1:] else 2))
    ```

2) Run it (should be working with running from anywhere)
3) _(Optional)_ If your template data is too big and template JSON-file becomes too heavy, you can run this script with `-compact` flag. In this way, template JSON-file will be written in one line.