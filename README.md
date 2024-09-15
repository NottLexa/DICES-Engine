# MareCreator
> Engine for creating interactive and automated TRPG character sheets.

by Alexey ["NotLexa"]((https://github.com/NottLexa)) Kozhanov (Алексей Кожанов)

[![GitHub License](https://img.shields.io/github/license/NottLexa/MareCreator)](https://github.com/NottLexa/MareCreator/blob/master/COPYING)

MareCreator consists of three parts:
* Render engine (for now it's only a plain HTML dynamic page for NW.JS)
* MareCreator Formula Parser (MCFP) - JavaScript's module for parsing attribute effects' or formulas' code, turning them
into JS objects that abstractly represent formula's code parts, and (optionally) converting these objects into JS function.
* Template Builder - Python module for building (compiling) MareCreator templates in format of JSON, using MareCreator
attributes written in Python (Python 3.x, preferably >=3.10).

Made for [@arkain123](https://github.com/arkain123) ≽^•⩊•^≼

## How to install

1) Install [NodeJS](https://nodejs.org).
2) Run shell command `npm install` in repository's directory.

## How to run

1) Run shell command `npm run start` in repository's directory.

## How to build templates

1) Create a python build script with extention `.build.py`:
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
        template_json_path = __file__[:(-9 if __file__.endswith('.build.py') else -3)]+'.json'
        #print(tb.dump_data(template_data))
        with open(template_json_path, 'w') as f:
            if ('-compact' in sys.argv[1:]):
                json.dump(template_data.parse(), f)
            else:
                json.dump(template_data.parse(), f, indent=2)
    ```

2) Run it (should be working with running from anywhere)