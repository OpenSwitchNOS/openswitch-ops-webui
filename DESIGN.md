High level design of OPS-FOO
============================

High level description of OPS-FOO design. 

Reponsibilities
---------------
Discuss module responsibilities

Design choices
--------------
Discuss any design choices that were made.

Relationships to external OpenSwitch entities
---------------------------------------------
{% ditaa %}
Put ascii diagram in the format of http://ditaa.sourceforge.net/
include relationship to ovsdb-server, ops-appctl if available and any other relationships
You can use http://asciiflow.com/ or any other tool to generate the diagram.
{% endditaa %}
Provide detailed description of relationships and interactions.

OVSDB-Schema
------------
Discuss which tables/columns this module is interested in. Where it gets the configuration, exports statuses and statistics. Anything else which is relevant to the data model of the module.

Internal structure
------------------
Put diagrams and text explaining major modules, threads, data structures, timers etc. 

Any other sections that are relevant for the module
---------------------------------------------------

References
----------
* [Reference 1](http://www.openswitch.net/docs/redest1)
* ...

Include references to any other modules that interact with this module directly or through the database model. For example, CLI, REST, etc.
ops-fand might provide reference to ops-sensord, etc.
