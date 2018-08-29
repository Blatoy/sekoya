# What is Sekoya?
In short, sekoya is a XML tree editor that supports "branching" (conditions).
Its main goal is to provide a software that is easier and more "comfortable" to use than the BehaviourTreeCreator made by Ronimo Games as
in my opinion it's missing a lot of shortcuts and options.

# How can I help?
The software is currently not finished and the code is a HUGE mess so I will gladly take any suggestion but at the moment I prefer to finish it and clean it before accepting code contributions. I will think about it in the future though.

# Changes to make to use the Blockdefinitions.xml from Awesomenauts in Sekoya
If you want to use the latest version of the block-definition.xml from Awesomenauts there are a couple of changes to make if you want everything
to work properly:

1. Add at the end of the file, before </blockdefinitions>
`<logic>
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
</other>`

2. Replace `conditions` by `condition` and `actions` by `action`
3. Replace `/string name="(width|height|health value)"` by `float name="$1"`
