# What is Sekoya?
Sekoya is a XML tree editor that supports "branching" (like conditions)
Its main goal is to provide a software that is easier and more "comfortable" to use than the BehaviourTreeCreator made by Ronimo Games by adding a lot of shortcuts and the ability to do everything without a mouse. Even if the software has currently all the blocks required to works for Awesomenauts, it's easy to change the block definition file to use it for any other purpose.

![Screenshot of Sekoya](https://orikaru.net/dl/sekoya-demo.png)

# How can I help?
The software is still in alpha and the code is a HUGE mess so I will gladly take any suggestion but at the moment I prefer to finish it and clean it before accepting code contributions.

# Downloading and executing Sekoya
Check [the wiki](https://github.com/Blatoy/sekoya/wiki/Change-logs) for the latest version, you can also build it yourself by following the instructions below
1. Install the latest version of NodeJS (you can download it [here](https://nodejs.org/en/))
2. Clone the repository `git clone https://github.com/Blatoy/sekoya.git`
3. Move to its directory `cd sekoya`
4. Install all the required libs with `npm install`
5. Start it with `npm start`

# Creating an executable
I'm using [electron-packager](https://github.com/electron-userland/electron-packager) to package Sekoya as it's easy to use.
1. `npm install electron-packager -g`
2. `electron-packager .`

# Changes to make to use the Blockdefinitions.xml from Awesomenauts in Sekoya
If you want to use the latest version of the block-definition.xml from Awesomenauts there are a couple of changes to make if you want everything
to work properly:

1. Add at the end of the file, before `</blockdefinitions>`
```xml
<logic>
  <logic name="orblock" useNameAttributeAsTagName="1" displayName="Or">
  </logic>
  <logic name="andblock" useNameAttributeAsTagName="1" displayName="And">
  </logic>
</logic>

<other>
  <other name="Sequence" useNameAttributeAsTagName="1" >
    <string name="Is blocking" values="yesno" defaultvalue="no"/>
  </other>
  <root name="Root" hidden="1" useNameAttributeAsTagName="1" preventInteraction="1">
  </root>
</other>
```
2. Replace `conditions` by `condition` and `actions` by `action`
3. Replace `/string name="(width|height|health value)"/` by `float name="$1"` (if you don't want to use a regex, replace "string" by "float" where name= width, height or health value
